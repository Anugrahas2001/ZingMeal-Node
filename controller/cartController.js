const cuid = require("cuid");
const { dataSource } = require("../db/connection");

async function createCart(req, res) {
  try {
    const { userId } = req.params;
    console.log(userId, "user id");

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const cart = {
      id: cuid(),
      user: userId,
      totalPrice: 0,
      createdBy: user.name,
      createdOn: new Date(),
    };
    const cartRepository = dataSource.getRepository("Cart");
    await cartRepository.save(cart);

    return res
      .status(201)
      .json({ message: "Cart created successfully", Data: cart });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create cart" });
  }
}

async function deleteCart(req, res) {
  try {
    const { cartId } = req.params;

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cartRepository.remove(cart);
    return res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove cart" });
  }
}

async function calculateTotalPrice(req, res) {
  try {
    const { cartId } = req.params;

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart is not found" });
    }
    const allCartItems = await cartRepository.find();
    for (const cartItem of allCartItems) {
      const food = await foodRepository.findOne({
        where: { id: cartItem.food.id },
      });
      if (food) {
        totalPrice += cartItem.quantity * food.price - discountPrice;
      }
      totalPrice += deliveryCharge;
    }
    cart.totalPrice = totalPrice;
    await cartRepository.save(cart);

    return res
      .status(200)
      .json({ message: "successfully calculated totalprice", Data: cart });
  } catch (error) {
    return res.status(500).json({ message: "Failed to calculate totalPrice" });
  }
}

module.exports = { createCart, deleteCart, calculateTotalPrice };
