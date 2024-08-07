const cuid = require("cuid");
const { dataSource } = require("../db/connection.js");
const { orderStatus } = require("../enum/OrderStatus.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
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

module.exports = { createOrder, paymentSuccess, updateOrderStatus };
