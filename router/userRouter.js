const express = require("express");
const { authentication } = require("../middleware/authentication.js");
const {
  signUp,
  login,
  searchByRestuarantOrFood,
  createAccessToken,
} = require("../controller/userController.js");
const router = express.Router();

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/search/:query", searchByRestuarantOrFood);

router.post("/accessToken", createAccessToken);

router.get("/addToCart/:userId/:foodId", addToCart);

module.exports = { userRouter: router };
