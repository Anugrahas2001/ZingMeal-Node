const cuid = require("cuid");
const { dataSource } = require("../db/connection");

async function createCart(req, res) {
  try {
    const { userId } = req.params;

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
      deliveryTime: 0,
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
    const { restuarentId, cartId } = req.params;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: restuarentId },
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart is not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const allCartItems = await cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ["cart", "food"],
    });

    const totalAmount = allCartItems.reduce((total, item) => {
      const itemTotalPrice = item.quantity * item.food.discountPrice;
      return total + itemTotalPrice;
    }, 0);

    cart.totalPrice = Number((totalAmount + cart.deliveryCharge).toFixed(1));
    await cartRepository.save(cart);

    return res
      .status(200)
      .json({ message: "successfully calculated totalprice", Data: cart });
  } catch (error) {
    return res.status(500).json({ message: "Failed to calculate totalPrice" });
  }
}

async function calculateDeliveryTime(req, res) {
  try {
    const { restuarentId, cartId } = req.params;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: restuarentId },
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItemRepository = dataSource.getRepository("CartItem");
    const allCartItems = await cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ["cart", "food"],
    });
    const totalTime = allCartItems.reduce((total, item) => {
      return (total += item.food.preparingTime);
    }, 0);

    const avgPreparationTime = totalTime / allCartItems.length;
    cart.deliveryTime = Math.round(avgPreparationTime + 30);
    await cartRepository.save(cart);
    return res
      .status(200)
      .json({ message: "Delivery time updated successfully", Data: cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to update delivery time in cart" });
  }
}

async function updateDeliveryCharge(req, res) {
  try {
    const { restuarentId, cartId } = req.params;
    const { deliveryCharge } = req.body;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: restuarentId },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const cartRepository = dataSource.getRepository("Cart");
    const cart = await cartRepository.findOne({
      where: { id: cartId },
    });

    cart.deliveryCharge = deliveryCharge ? deliveryCharge : cart.deliveryCharge;
    cart.modifiedBy = restaurant.restaurantName;
    cart.modifiedOn = new Date();

    await cartRepository.save(cart);

    return res
      .status(200)
      .json({ message: "cart item updated successfully", Data: cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to update delivery charge" });
  }
}

module.exports = {
  createCart,
  deleteCart,
  calculateTotalPrice,
  calculateDeliveryTime,
  updateDeliveryCharge,
};
