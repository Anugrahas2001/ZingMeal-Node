const { dataSource } = require("../db/connection.js");
const { Restaurant } = require("../model/Restaurant.js");
const Encrypt = require("../hepler/encrypt.js");
const cloudinary = require("../cloudinary/cloudinary.js");
const upload = require("../middleware/multer.js");
const encrypt = new Encrypt();
const cuid = require("cuid");
const { RefreshToken } = require("../model/RefreshToken.js");

async function signUp(req, res) {
  await new Promise((resolve, reject) => {
    upload.single("restaurantImg")(req, res, (err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
  try {
    const {
      restaurantName,
      restaurantAddress,
      restaurantPassword,
      openingTime,
      closingTime,
    } = req.body;
    const encodedPassword = await encrypt.encryptPass(restaurantPassword);
    console.log(encodedPassword, "password is encoded");

    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result, "result from cloudinary");

    const restaurantId = cuid();

    const rating = {
      id: cuid(),
      itemId: restaurantId,
      itemRating: 1.0,
      createdBy: restaurantName,
      createdOn: new Date(),
    };
    const ratingRepository = dataSource.getRepository("Rating");
    const savedRating = ratingRepository.save(rating);
    console.log(savedRating, "saved rating");

    const restaurant = {
      id: restaurantId,
      restaurantName: restaurantName,
      restaurantAddress: restaurantAddress,
      restaurantImg: result.url,
      restaurantPassword: encodedPassword,
      restaurantStatus: "Closed",
      openingTime: new Date(openingTime),
      closingTime: new Date(closingTime),
      createdOn: new Date(),
      createdBy: restaurantName,
    };
    console.log(restaurant, "restuarent saved");

    const restaurantRepository = dataSource.getRepository("Restaurant");
    restaurantRepository.save(restaurant);

    console.log("going to genarate token");

    // const token = encrypt.generateToken({ id: restaurant.id });

    const accessToken = encrypt.generateToken({ id: restaurant.id });
    const refreshToken = encrypt.generateRefreshToken({ id: restaurant.id });
    console.log(accessToken, "access", refreshToken, "refresh token created");

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = {
      id: cuid(),
      token: refreshToken,
      itemId: restaurant.id,
    };
    await tokenRepository.save(token);

    return res.status(201).json({
      message: "Restuarent created successfully",
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Restuarent creation failed" });
  }
}

async function login(req, res) {
  try {
    const { restaurantName, restaurantPassword } = req.body;

    if (!restaurantName || !restaurantPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { restaurantName },
    });

    const isValidPassword = await encrypt.comparePassword(
      restaurantPassword,
      restaurant.restaurantPassword
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const accessToken = encrypt.generateToken({ id: restaurant.id });
    const refreshToken = encrypt.generateRefreshToken({ id: restaurant.id });

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({
      message: "Restuarent Login Successfully",
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Login failed" });
  }
}
async function deleteRestuarent(req, res) {
  try {
    const { id } = req.params;
    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: id },
    });
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `Restuarent not found with this id ${id}` });
    }
    await restaurantRepository.remove(restaurant);
    return res.status(200).json({ message: "Restuarent succesffully deleted" });
  } catch (error) {
    return res.status(403).json({ message: "Failed to delete restuarent" });
  }
}

async function updateRestuarent(req, res) {
  try {
    const { id, restaurantStatus } = req.params;
    console.log(id, restaurantStatus, "restuarent id");

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: id },
    });
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `Restuarent with this id ${id} not found` });
    }
    console.log(restaurant, "before update");

    restaurant.restaurantName = req.body.restaurantName
      ? req.body.restaurantName
      : restaurant.restaurantName;

    restaurant.restaurantImg = req.body.restaurantImg
      ? req.body.restaurantImg
      : restaurant.restaurantImg;

    restaurant.restaurantStatus = req.body.restaurantStatus
      ? req.body.restaurantStatus
      : restaurant.restaurantStatus;

    restaurant.openingTime = req.body.openingTime
      ? req.body.openingTime
      : restaurant.openingTime;

    restaurant.closingTime = req.body.closingTime
      ? req.body.closingTime
      : restaurant.closingTime;

    restaurant.modifiedBy = restaurant.restaurantName;
    restaurant.modifiedOn = new Date();
    console.log(restaurant, "after update");
    await restaurantRepository.save(restaurant);
    return res.status(200).json({
      message: "Resturent successfully updated",
      Data: restaurant,
    });
  } catch (error) {
    return res.status(403).json({ message: "Failed update the restuarent" });
  }
}

async function getAllRestuarents(req, res) {
  try {
    const restaurantRepository = dataSource.getRepository("Restaurant");
    const allRestaurants = await restaurantRepository.find({});

    return res.status(200).json({
      message: "Successfully retrieved all restuarents",
      Data: allRestaurants,
    });
  } catch (error) {
    return res.status(403).json({ message: "Failed to retrieve restuarents" });
  }
}

async function getRestaurantById(req, res) {
  try {
    const { id } = req.params;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: id },
    });
    console.log(restaurant);
    return res
      .status(200)
      .json({ message: "Successfully data retrieved", Data: restaurant });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve restaurant" });
  }
}

module.exports = {
  signUp,
  login,
  getAllRestuarents,
  updateRestuarent,
  deleteRestuarent,
  getRestaurantById,
};
