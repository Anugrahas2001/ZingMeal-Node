const cuid = require("cuid");
const { dataSource } = require("../db/connection");
const { Cart } = require("../model/Cart.js");
const { CartItem } = require("../model/CartItem.js");
const { Food } = require("../model/Food.js");
const { User } = require("../model/User.js");

async function addToCart(req, res) {
  try {
    const { userId, cartId, foodId } = req.params;
    console.log(foodId, cartId, userId, "food id");

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    console.log(user, "user");
    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res
        .status(404)
        .json({ message: `Cart with this id ${cartId} is not present.` });
    }
    console.log(cart, "cart");

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { cart: { id: cartId }, food: { id: foodId } },
    });
    console.log(cartItem, "item");

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItemRepository.save(cartItem);
      return res
        .status(200)
        .json({ message: "Item successfully added to the cart", Data: cart });
    }
    console.log("cartItem not found");
    const cartItems = {
      id: cuid(),
      quantity: 1,
      cart: cartId,
      food: foodId,
      createdBy: user.name,
      createdOn: new Date(),
    };
    console.log("success");
    await cartItemRepository.save(cartItems);
    return res
      .status(200)
      .json({ message: "Item successfully added to the cart", Data: cart });
  } catch (error) {
    return res.status(403).json({ message: "Failed to add item into cart" });
  }
}

async function removeFromCart(req, res) {
  try {
    const { cartItemId } = req.params;
    console.log(cartItemId, "cartt item id");

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { id: cartItemId },
    });
    console.log(cartItem, "cart item remove");
    cartItemRepository.remove(cartItem);
    return res.status(200).json({ message: "Cart Item removed successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Failed to remove cart Item" });
  }
}

async function updateQuantity(req, res) {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity should be > 0" });
    }

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { id: itemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item is not found" });
    }
    cartItem.quantity = quantity ? quantity : cartItem.quantity;
    cartItem.modifiedBy = user.name;
    cartItem.modifiedOn = new Date();
    await cartItemRepository.save(cartItem);
    return res
      .status(200)
      .json({ message: "Quantity updated successfully", Data: cartItem });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update quantity" });
  }
}

module.exports = { addToCart, removeFromCart, updateQuantity };
