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

// async function removeFromCart(req, res) {
//   try {
//     const { cartItemId } = req.params;
//     console.log(cartItemId, "cartt item id");

//     const cartItemRepository = dataSource.getRepository("CartItem");
//     const cartItem = await cartItemRepository.findOne({
//       where: { id: cartItemId },
//     });
//     console.log(cartItem, "cart item remove");
//     cartItemRepository.remove(cartItem);
//     return res.status(200).json({ message: "Cart Item removed successfully" });
//   } catch (error) {
//     return res.status(403).json({ message: "Failed to remove cart Item" });
//   }
// }

async function updateCartItem(req, res) {
  try {
    const { cartItemId } = req.params;
    const { value } = req.body;

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not present" });
    }

    if (value > 0) {
      cartItem.quantity += 1;
      await cartItemRepository.save(cartItem);
      return res.status(200).json({
        message: "cart item quantity increased successfully",
        Data: cartItem,
      });
    } else if (value < 0) {
      cartItem.quantity -= 1;
      await cartItemRepository.save(cartItem);
      return res.status(200).json({
        message: "cart item quantity decreased successfully",
        Data: cartItem,
      });
    }
    await cartItemRepository.remove(cartItem);
    return res
      .status(200)
      .json({ message: "cart item removed successfully", Data: cartItem });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update the cart item" });
  }
}

module.exports = { addToCart, updateCartItem };
