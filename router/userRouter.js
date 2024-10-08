const express = require("express");
const { authentication } = require("../middleware/authentication.js");
const {
  signUp,
  login,
  searchByRestuarantOrFood,
  createAccessToken,
  logOut,
  newPassword,
} = require("../controller/userController.js");
const {
  addToCart,
  updateCartItem,
  getAllCartItems,
} = require("../controller/cartItemController.js");
const {
  createCart,
  deleteCart,
  getCart,
} = require("../controller/cartController.js");
const { updateRating } = require("../controller/ratingController.js");
const {
  createOrder,
  paymentSuccess,
  cancelOrder,
  getAllOrders,
} = require("../controller/orderController.js");

const router = express.Router();

router.post("/signUp", signUp);

router.post("/login", login);

router.patch("/forgotPassword/:userId", newPassword);

router.delete("/logout/:id", authentication, logOut);

router.get("/search/:query", searchByRestuarantOrFood);

router.post("/accessToken", createAccessToken);

router.post("/createCart/:userId", createCart);

router.get("/getCart/:userId", authentication, getCart);

router.delete("/deleteCart/:cartId", authentication, deleteCart);

router.post("/addToCart/:userId/:cartId/:foodId", authentication, addToCart);

// router.delete("/removeFromCart/:cartItemId", authentication, removeFromCart);

// router.patch("/updateQuantity/:userId/:itemId", authentication, updateQuantity);

router.get("/getAllCartItems/:cartId", getAllCartItems);

router.patch("/updateCartItem/:cartItemId", authentication, updateCartItem);

router.post("/createOrder", createOrder);

router.post("/paymentSuccess/:userId/:cartId", authentication, paymentSuccess);

router.get("/allOrderItems/:userId/:orderId", authentication, getAllOrders);

router.patch("/updateRating/:userId/:itemId", authentication, updateRating);

router.delete("/cancelOrder/:orderId", authentication, cancelOrder);

module.exports = { userRouter: router };
