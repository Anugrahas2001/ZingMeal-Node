const cuid = require("cuid");
const { dataSource } = require("../db/connection.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
const { paymentMethods } = require("../enum/paymentMethod.js");
const { Payment } = require("../model/Payment.js");
const { orderStatus } = require("../enum/orderStatus.js");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { In } = require("typeorm");
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
      orderStatus: orderStatus.Preparing,
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
      order.modifiedBy = restaurant.restaurantName;
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

      if (timeDifferenceInMn >= 30) {
        return res.status(400).json({
          message:
            "Order can only be cancelled within 30 minutes of being placed",
        });
      }

      if (order.orderStatus === "Preparing") {
        if (payment) await paymentRepository.remove(payment);
        order.orderStatus = orderStatus.Cancelled;
        await orderRepository.save(order);

        return res
          .status(200)
          .json({ message: "Order cancelled successfully", Data: order });
      } else {
        return res.status(400).json({
          message: `Can't cancel this order. Food order already ${order.orderStatus}.`,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Can't cancel this order" });
  }
}

async function filterBasedOnStatus(req, res) {
  try {
    const orderRepository = dataSource.getRepository("Order");
    const allOrders = await orderRepository.find({
      where: {
        orderStatus: In([
          orderStatus.Preparing,
          orderStatus.Packed,
          orderStatus.Dispatched,
        ]),
      },
      relations: ["orderItems", "orderItems.food"],
      order: { createdOn: "DESC" },
    });

    const order = ["Preparing", "Packed", "Dispatched"];

    const sortedOrders = allOrders.sort(
      (x, y) => order.indexOf(x.orderStatus) - order.indexOf(y.orderStatus)
    );

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

    const filteredOrders = orders.filter((order) => {
      return (
        order.orderStatus === orderStatus.Cancelled ||
        order.orderStatus === orderStatus.Delivered
      );
    });
    const sortedOrders = filteredOrders.sort(
      (a, b) =>
        new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    );

    return res.status(200).json({ Data: sortedOrders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function ordersInRestaurant(req, res) {
  try {
    const { restaurantId } = req.params;
    const orderRepository = dataSource.getRepository("Order");
    const orders = await orderRepository.find({
      where: { orderItems: { food: { restaurant: { id: restaurantId } } } },
      relations: [
        "orderItems",
        "orderItems.food",
        "orderItems.food.restaurant",
      ],
    });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function getAllOrders(req, res) {
  try {
    const { userId, orderId } = req.params;

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
    const userId = req.params;
    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartRepository = dataSource.getRepository("");

    const cartItems = await cartItemRepository.find({
      where: { cart: { user: { id: userId } } },
    });
    json({items:cartItems})
    if (!cartItems) {
      return res.status(404).json({ message: "Cartitems not found" });
    }

    const count = cartItems.reduce((total, item) => total + item.quantity, 0);

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
