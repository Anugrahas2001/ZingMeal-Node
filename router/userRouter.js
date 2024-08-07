const express = require("express");
const { authentication } = require("../middleware/authentication.js");
const {
  signUp,
  login,
  searchByRestuarantOrFood,
  createAccessToken,
} = require("../controller/userController.js");
const {
  addToCart,
  updateQuantity,
  removeFromCart,
} = require("../controller/cartItemController.js");
const { createCart, deleteCart } = require("../controller/cartController.js");
const { updateRating } = require("../controller/ratingController.js");
const {
  createOrder,
  paymentSuccess,
  cancelOrder,
} = require("../controller/orderController.js");

const router = express.Router();

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/search/:query", searchByRestuarantOrFood);

router.post("/accessToken", createAccessToken);

router.post("/createCart/:userId", authentication, createCart);

router.delete("/deleteCart/:cartId", authentication, deleteCart);

router.post("/addToCart/:userId/:cartId/:foodId", authentication, addToCart);

router.delete("/removeFromCart/:cartItemId", authentication, removeFromCart);

router.patch("/updateQuantity/:userId/:itemId", authentication, updateQuantity);

router.patch("/updateRating/:userId/:itemId", authentication, updateRating);

router.post("/createOrder", createOrder);

router.post("/paymentSuccess/:userId/:cartId", authentication, paymentSuccess);

router.delete("/cancelOrder/:orderId", authentication, cancelOrder);

module.exports = { userRouter: router };
