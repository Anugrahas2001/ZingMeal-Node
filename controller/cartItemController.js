const cuid = require("cuid");
const { dataSource } = require("../db/connection");
const { Cart } = require("../model/Cart.js");
const { CartItem } = require("../model/CartItem.js");
const { Food } = require("../model/Food.js");
const { User } = require("../model/User.js");

async function addToCart(req, res) {
  try {
    const { userId, cartId, foodId } = req.params;

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res
        .status(404)
        .json({ message: `Cart with this id ${cartId} is not present.` });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { cart: { id: cartId }, food: { id: foodId } },
    });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItemRepository.save(cartItem);
      return res.status(200).json({
        message: "Item successfully added to the cart",
        Data: cartItem,
      });
    }

    const cartItems = {
      id: cuid(),
      quantity: 1,
      cart: cartId,
      food: foodId,
      createdBy: user.name,
      createdOn: new Date(),
    };

    await cartItemRepository.save(cartItems);

    return res
      .status(200)
      .json({ message: "Item successfully added to the cart", Data: cart });
  } catch (error) {
    return res.status(403).json({ message: "Failed to add item into cart" });
  }
}

async function updateCartItem(req, res) {
  try {
    const { cartItemId } = req.params;
    const { value } = req.body;

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (value > 0) {
      cartItem.quantity += value;
    } else if (value < 0) {
      cartItem.quantity += value;
      if (cartItem.quantity <= 0) {
        await cartItemRepository.remove(cartItem);
        return res.status(200).json({
          message: "Cart item removed successfully",
          Data: cartItem,
        });
      }
    } else if (value === 0) {
      await cartItemRepository.remove(cartItem);
      return res.status(200).json({
        message: "Cart item removed successfully",
        Data: cartItem,
      });
    }

    await cartItemRepository.save(cartItem);
    return res.status(200).json({
      message: "Cart item updated successfully",
      Data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update the cart item" });
  }
}

async function getAllCartItems(req, res) {
  try {
    const { cartId } = req.params;
    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItems = await cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ["cart", "food"],
    });

    return res
      .status(200)
      .json({ message: "successfully retrieved data", Data: cartItems });
  } catch (error) {
    return res.status(500).json({ message: "failed to retrieve data" });
  }
}

module.exports = { addToCart, updateCartItem, getAllCartItems };
