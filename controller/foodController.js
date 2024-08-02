const { dataSource } = require("../db/connection");
const { Food } = require("../model/Food.js");
const { Restuarent } = require("../model/Restuarent.js");
const cuid = require("cuid");
const cloudinary = require("../cloudinary/cloudinary.js");
const upload = require("../middleware/multer.js");
const { path } = require("path");

async function createFood(req, res) {
  try {
    await new Promise((resolve, reject) => {
      upload.single("imageFile")(req, res, (err) => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
    const { restuarentId } = req.params;

    const restuarentRepository = dataSource.getRepository("Restuarent");
    const restuarent = await restuarentRepository.findOne({
      where: { id: restuarentId },
    });

    if (!restuarent) {
      return res
        .status(404)
        .json({ message: `Restuarent not found with this id ${restuarentId}` });
    }
    const result = await cloudinary.uploader.upload(req.file.path);

    const food = {
      id: cuid(),
      foodName: req.body.foodName,
      imageFile: result.url,
      foodDescription: req.body.foodDescription,
      foodType: req.body.foodType,
      foodCategory: req.body.foodCategory,
      discount: 0,
      price: req.body.price,
      createdBy: restuarent.restuarentName,
      createdOn: new Date(),
      restuarent: restuarent.id,
    }
    const foodRepository = dataSource.getRepository("Food");
    await foodRepository.save(food);

    return res.status(201).json({ message: "Food item created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Food creation failed" });
  }
}

async function getAllFoods(req, res) {
  try {
    const foodRepository = dataSource.getRepository("Food");
    const allFoods = await foodRepository.find({});

    return res
      .status(200)
      .json({ message: "All foods are retrieved successfully", allFoods });
  } catch (error) {
    return res.status(404).json({ message: "Failed to retrieve foods" });
  }
}

async function getFoodById(req, res) {
  try {
    const { id } = req.params.id;

    const foodRepository = dataSource.getRepository("Food");
    const food = await foodRepository.findOne({
      where: { id },
    });
    if (!food) {
      return res
        .status(404)
        .json({ message: `food not found with this is ${id}` });
    }

    return res
      .status(200)
      .json({ message: "Food item successfully retrieved", food });
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Failed to retrieve food item with this id ${id}` });
  }
}

async function updateFood(req, res) {
  try {
    const { restuarentId, foodId } = req.params;
    console.log(restuarentId, "id of restuarent");
    const restuarentRepository = dataSource.getRepository("Restuarent");
    const restuarent = await restuarentRepository.findOne({
      where: { id: restuarentId },
    });
    if (!restuarent) {
      return res
        .status(404)
        .json({ message: `Restuarent not found with this id ${restuarentId}` });
    }
    console.log(restuarent, "to update");

    console.log(foodId, "foodId");
    const foodRepository = dataSource.getRepository("Food");
    const food = await foodRepository.findOne({
      where: { id: foodId },
    });

    if (!food) {
      return res
        .status(404)
        .json({ message: `food not found with this is ${foodId}` });
    }
    console.log(food, "old food object");
    food.foodName = req.body.foodName ? req.body.foodName : food.foodName;
    food.foodImg = req.body.foodImg ? req.body.foodImg : food.foodImg;
    food.foodDescription = req.body.foodDescription
      ? req.body.foodDescription
      : food.foodDescription;
    food.foodType = req.body.foodType ? req.body.foodType : food.foodType;
    food.foodCategory = req.body.foodCategory
      ? req.body.foodCategory
      : food.foodCategory;
    food.discount = req.body.discount ? req.body.discount : food.discount;
    food.price = req.body.price ? req.body.price : food.price;
    food.modifiedBy = restuarent.restuarentName;
    food.modifiedOn = new Date();
    console.log(food, "updated food");
    await foodRepository.save(food);
    console.log("successfully updated");
    return res
      .status(200)
      .json({ message: "food item is suucessfully updated", food });
  } catch (error) {
    return res.status(204).json({ message: "Failed to update food item" });
  }
}

async function deleteFood(req, res) {
  try {
    const { id } = req.params.id;

    const foodRepository = dataSource.getRepository("Food");
    const food = await foodRepository.findOne({
      where: { id: id },
    });

    if (!food) {
      return res
        .status(404)
        .json({ message: `food item not found with this id ${id}` });
    }

    await foodRepository.remove(food);
    return res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    return res.status(204).json({ message: "Failed to delete food item" });
  }
}

module.exports = {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
};
