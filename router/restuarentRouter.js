const express = require("express");
const router = express.Router();
const { signUp, login } = require("../controller/restuarentController.js");
const { authentication } = require("../middleware/authentication.js");
const {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controller/foodController.js");

router.post("/signUp", signUp);

router.post("/login", login);

router.post("/createFood/:id", createFood);

router.get("/allFoods", getAllFoods);

router.get("/food/:id", getFoodById);

router.put("/updateFood/:restuarentId/:foodId", updateFood);

router.delete("/delete/:id", deleteFood);

module.exports = { restuarentRouter: router };
