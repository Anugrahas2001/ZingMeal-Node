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
} = require("../controller/orderController.js");


const router = express.Router();

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/search/:query", searchByRestuarantOrFood);

router.post("/accessToken", createAccessToken);

router.post("/createCart/:userId", createCart);

router.delete("/deleteCart/:cartId", deleteCart);

router.post("/addToCart/:userId/:cartId/:foodId", addToCart);

router.delete("/removeFromCart/:cartItemId", removeFromCart);

router.patch("/updateQuantity/:userId/:itemId", updateQuantity);

router.patch("/updateRating/:userId/:itemId", updateRating);

router.post("/createOrder", createOrder);

router.post('/paymentSuccess/:userId/:cartId', paymentSuccess);

router.delete("/cancelOrder/:userId/:orderId",cancelOrder);

module.exports = { userRouter: router };
