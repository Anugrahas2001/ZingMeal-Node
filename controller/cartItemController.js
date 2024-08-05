const cuid = require("cuid");
const { dataSource } = require("../db/connection");

async function addToCart(req, res) {
  try {
    const { userId, cartId, foodId } = req.params;
    console.log(foodId,cartId,userId, "food id");

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
      where: { user: cartId, food: foodId },
    });

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      const cartItem = {
        id: cuid(),
        quantity: 1,
        cart: cartId,
        food: foodId,
        createdBy: user.name,
        createdOn: new Date(),
      };
    }

    await cartRepository.save(cartItem);
    return res
      .status(200)
      .json({ message: "Item successfully added to the cart", Data: cart });
  } catch (error) {
    return res.status(403).json({ message: "Failed to add item into cart" });
  }
}

async function removeFromCart(req, res) {
  try {
    const { id } = req.params;

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = cartItemRepository.findOne({
      where: { id: id },
    });
    cartItemRepository.remove(cartItem);
    return res.status(200).json({ message: "Cart Item removed successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Failed to remove cart Item" });
  }
}

async function updateQuantity(req, res) {
  try {
    const { itemId } = req.params;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity should be > 0" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const cartItem = await cartItemRepository.findOne({
      where: { id: itemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item is not found" });
    }
    cartItem.quantity ? quantity : cartItem.quantity;
    await cartItemRepository.save(cartItem);
    return res
      .status(200)
      .json({ message: "Quantity updated successfully", Data: cartItem });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update quantity" });
  }
}

module.exports = { addToCart, removeFromCart, updateQuantity };
