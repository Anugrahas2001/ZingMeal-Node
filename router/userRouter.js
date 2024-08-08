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
//yes

router.post("/login", login);
//yes

router.get("/search/:query", searchByRestuarantOrFood);
//no

router.post("/accessToken", createAccessToken);
//yes

router.post("/createCart/:userId", authentication, createCart);
//yes

router.delete("/deleteCart/:cartId", authentication, deleteCart);
//yes

router.post("/addToCart/:userId/:cartId/:foodId", authentication, addToCart);
//yes

router.delete("/removeFromCart/:cartItemId", authentication, removeFromCart);
//yes

router.patch("/updateQuantity/:userId/:itemId", authentication, updateQuantity);
//yes

router.post("/createOrder", createOrder);
//yes

router.post("/paymentSuccess/:userId/:cartId", authentication, paymentSuccess);
//yes

router.patch("/updateRating/:userId/:itemId", authentication, updateRating);

router.delete("/cancelOrder/:orderId", authentication, cancelOrder);

module.exports = { userRouter: router };
