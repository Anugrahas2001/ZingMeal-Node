const cuid = require("cuid");
const { dataSource } = require("../db/connection.js");
const { orderStatus } = require("../enum/OrderStatus.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
const { formatInTimeZone } = require("date-fns-tz");
const { Payment } = require("../model/Payment.js");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const crypto = require("crypto");
dotenv.config();

async function createOrder(req, res) {
  const { amount, currency, receipt } = req.body;

  var options = {
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
      console.log(order);
      if (err) {
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

    const generatedSignature = crypto
      .createHmac("SHA256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const allCartItems = await cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ["cart", "food"],
    });

    const orderRepository = dataSource.getRepository("Order");
    const orderItemRepository = dataSource.getRepository("OrderItem");
    const paymentRepository = dataSource.getRepository("Payment");

    const orderData = {
      id: cuid(),
      orderStatus: orderStatus.PENDING,
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
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      razorpaySignature: razorpaySignature,
      paymentMethods: paymentMethod,
      user: userId,
      order: orderData.id,
      createdOn: new Date(),
    };

    await paymentRepository.save(payment);

    allCartItems.map((item) => {
      cartItemRepository.remove(item);
    });

    res
      .status(200)
      .json({ message: "Order placed successfully", Data: orderData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { restaurantId, orderId } = req.params;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    const orderRepository = dataSource.getRepository("Order");
    const order = await orderRepository.findOne({
      where: { id: orderId },
    });
    console.log(order, "orderrr");

    (order.orderStatus = req.body.orderStatus
      ? req.body.orderStatus
      : order.orderStatus),
      (modifiedBy = restaurant.restaurantName);
    modifiedOn = new Date();

    await orderRepository.save(order);
    return res
      .status(200)
      .json({ message: "Successfully updated order status" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update the order status" });
  }
}

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.params;
    console.log(orderId, "order id");

    const orderRepository = dataSource.getRepository("Order");
    const order = await orderRepository.findOne({
      where: { id: orderId },
    });

    console.log(order, "orderrr");

    const orderItemRepository = dataSource.getRepository("OrderItem");
    const allOrderItem = await orderItemRepository.find({
      where: { order: { id: orderId } },
    });

    console.log(allOrderItem, "allOrders");

    const paymentRepository = dataSource.getRepository("Payment");
    const payment = await paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    console.log(payment, "payment");
    const currentTime = new Date().getTime();
    const createdTime = order.createdOn.getTime();
    console.log(currentTime, "current time", createdTime, "created on");
    const timeDifferenceinMs = currentTime - createdTime;
    console.log(timeDifferenceinMs, "time difference");

    const timeDifferenceinHr = timeDifferenceinMs / (1000 * 60 * 60);
    console.log(timeDifferenceinHr, "in hours");

    if (timeDifferenceinHr <24) {
      console.log("deleting");
      await Promise.all(
        allOrderItem.map((item) => orderItemRepository.remove(item))
      );
      console.log("orderitem deleted");
      await paymentRepository.remove(payment);
      console.log("payment deleted");
      await orderRepository.remove(order);
      console.log("deleted");
      return res.status(200).json({ message: "Order cancelled successfully" });
    }
    console.log("item cancelled");
    return res.status(400).json({ message: "Can't cancel this order" });
  } catch (error) {
    return res.status(500).json({ message: "Can't cancel this order" });
  }
}

async function filterBasedOnStatus(req, res) {
  try {
    const orderRepository = dataSource.getRepository("Order");
    const allOrders = await orderRepository.find();
    console.log(allOrders, "all orders");

    const pendingOrders = allOrders.sort((order1, order2) => {
      if (
        order1.status === orderStatus.PENDING &&
        order2.status != orderStatus.PENDING
      ) {
        return -1;
      }
      if (
        order1.status != orderStatus.PENDING &&
        order2.status === orderStatus.PENDING
      ) {
        return 1;
      }
      return 0;
    });
    console.log(pendingOrders, "pending orders");
    return res
      .status(200)
      .json({ message: "Orders sorted based on status", Data: pendingOrders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sort orders" });
  }
}

async function cancelAndDelivered(req, res) {
  try {
    const orderRepository = dataSource.getRepository("Order");
    const allcancelledAndDeliveredOrdes = await orderRepository.find({
      where: [
        { orderStatus: orderStatus.CANCELLED },
        { orderStatus: orderStatus.DELIVERED },
      ],
      order: {
        createdOn: "DESC",
      },
    });
    console.log(allcancelledAndDeliveredOrdes,"all orders")

  
    allcancelledAndDeliveredOrdes.map((order) => {
      const formattedTime = formatInTimeZone(order.createdOn, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
      console.log(order.id, formattedTime, "time");
    });
    console.log(allcancelledAndDeliveredOrdes, "alll");
    return res.status(200).json({
      message: "successfully sorted bsed on created time",
      Data: allcancelledAndDeliveredOrdes,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sort order" });
  }
}

module.exports = {
  createOrder,
  paymentSuccess,
  updateOrderStatus,
  cancelOrder,
  filterBasedOnStatus,
  cancelAndDelivered,
};
