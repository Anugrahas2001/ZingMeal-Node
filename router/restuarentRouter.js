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
const {
  calculateTotalPrice,
  calculateDeliveryTime,
  updateDeliveryCharge,
} = require("../controller/cartController.js");
const {
  updateOrderStatus,
  filterBasedOnStatus,
  cancelAndDelivered,
  ordersInRestaurant,
} = require("../controller/orderController.js");

router.post("/signUp", signUp);
//yes

router.post("/login", login);
//yes

router.get("/getRestaurant/:id", getRestaurantById);
//yes

router.get("/allRestaurants", getAllRestuarents);
//yes

router.put("/updateRestaurant/:id", updateRestuarent);
//yes

router.delete("/deleteRestaurant/:id", deleteRestuarent);
//yes

router.post("/createFood/:restaurantId", createFood);
//yes

router.get("/allFoods", getAllFoods);
//yes

router.get("/food/:id", getFoodById);
//yes

router.get(
  "/getAllFoodsInRestaurant/:restaurantId",
  getAllFoodsBasedOnRestaurant
);
//yes

router.get("/foodByType/:foodType", getFoodsBasedOnType);
//yes

router.get("/foodsByCategory/:category", getAllFoodsBasedOnCategory);
//yes

router.put("/updateFood/:restuarentId/:foodId", updateFood);
//yes

router.delete("/delete/:foodId", deleteFood);
//yes

router.patch("/totalPrice/:restuarentId/:cartId", calculateTotalPrice);

//yes

router.patch("/deliveryTime/:restuarentId/:cartId", calculateDeliveryTime);
//yes

router.patch("/deliveryCharge/:restuarentId/:cartId", updateDeliveryCharge);
//yes

router.patch("/updateOrderStatus/:restaurantId/:orderId", updateOrderStatus);

router.get("/filterPending", filterBasedOnStatus);

router.get("/cancelAndDelivered", cancelAndDelivered);

router.get("/allOrdersInRestaurant/:restaurantId", ordersInRestaurant);

module.exports = { restuarentRouter: router };
