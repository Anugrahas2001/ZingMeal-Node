const cuid = require("cuid");
const { dataSource } = require("../db/connection.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
const { paymentMethods } = require("../enum/paymentMethod.js");
const { formatInTimeZone } = require("date-fns-tz");
const { Payment } = require("../model/Payment.js");
const { orderStatus } = require("../enum/orderStatus.js");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const crypto = require("crypto");
dotenv.config();

async function createOrder(req, res) {
  const { amount, currency, receipt } = req.body;

  const options = {
    amount: amount,
    currency: currency,
    receipt: receipt,
    payment_capture: 1,
  };

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: "Failed to create order" });
      }
      return res.status(200).json({ orderId: order.id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order" });
  }
}

async function paymentSuccess(req, res) {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      paymentMethod,
    } = req.body;
    const { userId, cartId } = req.params;

    let isSignatureValid = true;

    if (razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("SHA256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
      console.log("Signature verified successfully");
    }

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({ where: { id: cartId } });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const allCartItems = await cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ["cart", "food"],
    });

    if (allCartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Can't place order with empty cart items" });
    }

    const orderRepository = dataSource.getRepository("Order");
    const orderItemRepository = dataSource.getRepository("OrderItem");
    const paymentRepository = dataSource.getRepository("Payment");

    const orderData = {
      id: cuid(),
      orderStatus: orderStatus.PREPARING,
      totalPrice: cart.totalPrice,
      deliveryCharge: cart.deliveryCharge,
      deliveryTime: cart.deliveryTime,
      paymentStatus: paymentStatus.PAID,
      paymentMethods: paymentMethod,
      user: userId,
      cart: cartId,
      createdBy: userId,
      createdOn: new Date(),
    };

    await orderRepository.save(orderData);

    // Create order items
    const orderItems = allCartItems.map((cartItem) => {
      return orderItemRepository.create({
        id: cuid(),
        order: orderData.id,
        food: cartItem.food.id,
        quantity: cartItem.quantity,
        createdBy: userId,
        createdOn: new Date(),
      });
    });

    await orderItemRepository.save(orderItems);

    // Create payment entry
    const payment = {
      id: cuid(),
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      razorpaySignature: razorpaySignature || null,
      paymentMethods: paymentMethod,
      user: userId,
      order: orderData.id,
      createdOn: new Date(),
    };

    await paymentRepository.save(payment);

    await Promise.all(
      allCartItems.map((item) => cartItemRepository.remove(item))
    );

    res.status(200).json({
      message: "Order placed successfully",
      Data: orderData,
      OrderItems: orderItems,
      payment: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { restaurantId, orderId } = req.params;
    const { orderStatus } = req.body;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    const orderRepository = dataSource.getRepository("Order");
    const order = await orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      order.orderStatus = orderStatus || order.orderStatus;
      order.modifiedBy = restaurant ? restaurant.restaurantName : "Unknown";
      order.modifiedOn = new Date();

      await orderRepository.save(order);
      return res
        .status(200)
        .json({ message: "Successfully updated order status" });
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update the order status" });
  }
}

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.params;

    const orderRepository = dataSource.getRepository("Order");
    const order = await orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      const orderItemRepository = dataSource.getRepository("OrderItem");
      const allOrderItems = await orderItemRepository.find({
        where: { order: { id: orderId } },
      });

      const paymentRepository = dataSource.getRepository("Payment");
      const payment = await paymentRepository.findOne({
        where: { order: { id: orderId } },
      });

      const currentTime = new Date().getTime();
      const createdTime = order.createdOn.getTime();
      const timeDifferenceInMn = (currentTime - createdTime) / (1000 * 60);
      console.log(timeDifferenceInMn, "in minutess");

      if (timeDifferenceInMn < 30 && order.orderStatus === "PREPARING") {
        // await Promise.all(
        //   allOrderItems.map((item) => orderItemRepository.remove(item))
        // );
        if (payment) await paymentRepository.remove(payment);
        // await orderRepository.remove(order);
        order.orderStatus = orderStatus.CANCELLED;
        await orderRepository.save(order);
        console.log("saved");

        return res
          .status(200)
          .json({ message: "Order cancelled successfully", Data: order });
      } else {
        return res.status(400).json({ message: "Can't cancel this order" });
      }
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Can't cancel this order" });
  }
}

async function filterBasedOnStatus(req, res) {
  try {
    const orderRepository = dataSource.getRepository("Order");
    const allOrders = await orderRepository.find({
      relations: ["orderItems", "orderItems.food"],
    });

    const sortedOrders = allOrders.sort((order1, order2) => {
      if (
        order1.orderStatus === orderStatus.PREPARING &&
        order2.orderStatus !== orderStatus.PREPARING
      ) {
        return -1;
      }
      if (
        order2.orderStatus === orderStatus.PREPARING &&
        order1.orderStatus !== orderStatus.PREPARING
      ) {
        return 1;
      }
      return order2.createdOn - order1.createdOn;
    });

    await Promise.all(
      sortedOrders.map(async (order) => {
        const orderItemRepository = dataSource.getRepository("OrderItem");
        const orderItems = await orderItemRepository.find({
          where: { order: { id: order.id } },
          relations: ["food"],
        });
        return orderItems;
      })
    );

    console.log(sortedOrders, "sorted orders");

    return res.status(200).json({ sortedOrders });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch orders based on status" });
  }
}

async function cancelAndDelivered(req, res) {
  try {
    const orderRepository = dataSource.getRepository("Order");
    const orders = await orderRepository.find({
      relations: ["orderItems", "orderItems.food"],
    });
    console.log(orders, "1");

    const filteredOrders = orders.filter((order) => {
      const currentTime = new Date().getTime();
      const createdTime = order.createdOn.getTime();
      const timeDifferenceInHr = (currentTime - createdTime) / (1000 * 60 * 60);
      console.log(timeDifferenceInHr, "diffrence 2");

      return (
        (order.orderStatus === orderStatus.CANCELLED &&
          timeDifferenceInHr > 24) ||
        order.orderStatus === orderStatus.DELIVERED
      );
    });

    return res.status(200).json({ Data: filteredOrders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function ordersInRestaurant(req, res) {
  try {
    const { restaurantId } = req.params;
    console.log(restaurantId);
    const orderRepository = dataSource.getRepository("Order");
    console.log("shjsj", orderRepository);
    const orders = await orderRepository.find({
      where: { orderItems: { food: { restaurant: { id: restaurantId } } } },
      relations: [
        "orderItems",
        "orderItems.food",
        "orderItems.food.restaurant",
      ],
    });

    console.log(orders, "alll aorderrsg");
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function getAllOrders(req, res) {
  try {
    const { userId, orderId } = req.params;
    console.log(userId, orderId, "user and order");

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderItemRepository = dataSource.getRepository("OrderItem");
    const orderItems = await orderItemRepository.find({
      where: { order: { id: orderId } },
      relations: ["order", "food"],
    });

    console.log(orderItems, "order itemssss");
    return res.status(200).json({
      message: "Successfully retrieved orderItems",
      Data: orderItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reteive order items",
    });
  }
}

async function orderItemsCount(req, res) {
  try {
    const cartItemRepository = dataSource.getRepository("CartItem");

    const cartItems = await cartItemRepository.find();
    if (!cartItems) {
      return res.status(404).json({ message: "Cartitems not found" });
    }
    console.log(cartItems, "cartttthshbnxn");
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log(count, "mnumberrrer");
    return res
      .status(200)
      .json({ message: "Successfully got count", Count: count });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createOrder,
  paymentSuccess,
  updateOrderStatus,
  cancelOrder,
  filterBasedOnStatus,
  cancelAndDelivered,
  ordersInRestaurant,
  getAllOrders,
  orderItemsCount,
};
