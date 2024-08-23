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
  orderItemsCount,
} = require("../controller/orderController.js");

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/getRestaurant/:id", getRestaurantById);

router.get("/allRestaurants", getAllRestuarents);

router.put("/updateRestaurant/:id", updateRestuarent);

router.delete("/deleteRestaurant/:id", deleteRestuarent);

router.post("/createFood/:restaurantId", createFood);

router.get("/allFoods", getAllFoods);

router.get("/food/:id", getFoodById);

router.get(
  "/getAllFoodsInRestaurant/:restaurantId",
  getAllFoodsBasedOnRestaurant
);

router.get("/foodByType/:foodType", getFoodsBasedOnType);

router.get("/foodsByCategory/:category", getAllFoodsBasedOnCategory);

router.put("/updateFood/:restuarentId/:foodId", updateFood);

router.delete("/delete/:foodId", deleteFood);

router.get("/getCount", orderItemsCount);

router.patch("/totalPrice/:restuarentId/:cartId", calculateTotalPrice);

router.patch("/deliveryTime/:restuarentId/:cartId", calculateDeliveryTime);

router.patch("/deliveryCharge/:restuarentId/:cartId", updateDeliveryCharge);

router.patch("/updateOrderStatus/:restaurantId/:orderId", updateOrderStatus);

router.get("/filterPending", filterBasedOnStatus);

router.get("/cancelAndDelivered", cancelAndDelivered);

router.get("/allOrdersInRestaurant/:restaurantId", ordersInRestaurant);

module.exports = { restuarentRouter: router };
