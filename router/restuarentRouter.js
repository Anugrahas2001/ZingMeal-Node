const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  deleteRestuarent,
  updateRestuarent,
  getAllRestuarents,
} = require("../controller/restuarentController.js");
const {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controller/foodController.js");

router.post("/signUp", signUp);

router.post("/login", login);

router.get("/allRestuarents",getAllRestuarents);

router.put("/updateRestuarent/:id", updateRestuarent);

router.delete("/deleteRestuarent/:id", deleteRestuarent);

router.post("/createFood/:id", createFood);

router.get("/allFoods", getAllFoods);

router.get("/food/:id", (req,res)=>{
  console.log(req.body, "body");
  console.log(req.file, "file");
});

router.put("/updateFood/:restuarentId/:foodId", updateFood);

router.delete("/delete/:id", deleteFood);

module.exports = { restuarentRouter: router };
