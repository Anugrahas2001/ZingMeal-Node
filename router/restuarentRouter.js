const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  deleteRestuarent,
  updateRestuarent,
  getAllRestuarents,
  getRestaurantById,
} = require("../controller/restuarentController.js");
const {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  getAllFoodsBasedOnRestaurant,
  getFoodsBasedOnType,
  getAllFoodsBasedOnCategory,
} = require("../controller/foodController.js");

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/getRestaurant/:id", getRestaurantById);

router.get("/allRestaurants", getAllRestuarents);

router.put("/updateRestaurant/:id", updateRestuarent);

router.delete("/deleteRestaurant/:id", deleteRestuarent);

router.post("/createFood/:id", createFood);

router.get("/allFoods", getAllFoods);

router.get("/food/:id", getFoodById);

router.get(
  "/getAllFoodsInRestaurant/:restuarentId",
  getAllFoodsBasedOnRestaurant
);

router.get("/foodByType/:foodType", getFoodsBasedOnType);

router.get("/foodsByCategory/:cateogy", getAllFoodsBasedOnCategory);

router.put("/updateFood/:restuarentId/:foodId", updateFood);

router.delete("/delete/:id", deleteFood);

module.exports = { restuarentRouter: router };
