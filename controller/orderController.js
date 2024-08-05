const { dataSource } = require("../db/connection.js");
const { orderStatus } = require("../enum/OrderStatus.js");
const { paymentStatus } = require("../enum/paymentStatus.js");
const instance = require("../payment/instance.js");

async function createOrder(req, res) {
  var options = {
    amount: 50000,
    currency: "INR",
    receipt: "order_rcptid_11",
    payment_capture: 1,
  };

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
      userId,
      cartId,
    } = req.body;

    generated_signature = hmac_sha256(
      razorpayOrderId + "|" + razorpayPaymentId,
      secret
    );

    if (generated_signature != razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }
    const orderRepository = dataSource.getRepository("Order");
    const orderItemRepository = dataSource.getRepository("OrderItem");

    const order = {
      orderStatus: orderStatus.PENDING,
      totalPrice: cart.totalPrice,
      deliveryCharge: cart.deliveryCharge,
      deliveryTime: cart.deliveryTime,
      paymentStatus: paymentStatus.PAID,
      paymentMethods: paymentMethod,
      user: userId,
      cart: cartId,
    };
    await orderRepository.save(order);

    const orderItems = cart.cartItems.map((cartItem) => {
      return orderItemRepository.create({
        order: order.id,
        food: cartItem.food.id,
        quantity: cartItem.quantity,
        createdBy: userId,
        createdOn: new Date(),
      });
    });
    console.log(orderItems, "order items");

    await orderItemRepository.save(orderItems);

    await cartRepository.remove(cart);

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
}
module.exports = { createOrder, paymentSuccess };
