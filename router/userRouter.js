const express = require("express");
const { authentication } = require("../middleware/authentication.js");
const { signUp, login } = require("../controller/userController.js");
const router = express.Router();

router.post("/signUp", signUp);

router.post("/login",login);

module.exports = { userRouter: router };
