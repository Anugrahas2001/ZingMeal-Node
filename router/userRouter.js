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
const {
  createCart,
  deleteCart,
  calculateTotalPrice,
} = require("../controller/cartController.js");
const router = express.Router();

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/search/:query", searchByRestuarantOrFood);

router.post("/accessToken", createAccessToken);

router.post("/createCart/:userId", createCart);

router.delete("/deleteCart", deleteCart);

router.patch("/totalPrice/:cartId", calculateTotalPrice);

router.get("/addToCart/:userId/:cartId/:foodId", addToCart);

router.delete("/removeFromCart/:cartItemId", removeFromCart);

router.patch("/updateQuantity/:itemId", updateQuantity);

router.patch("/updateRating/:userId/:foodId", "updateRating");

module.exports = { userRouter: router };
