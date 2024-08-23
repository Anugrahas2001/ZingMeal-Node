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

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restuarentData = await restaurantRepository.findOne({
      where: { restaurantName: restaurantName },
    });

    if (restuarentData) {
      return res.status(400).json({ message: "Restaurant already exist" });
    }

    const encodedPassword = await encrypt.encryptPass(restaurantPassword);

    const result = await cloudinary.uploader.upload(req.file.path);

    const restaurantId = cuid();

    const rating = {
      id: cuid(),
      itemId: restaurantId,
      itemRating: 1.0,
      createdBy: restaurantName,
      createdOn: new Date(),
    };
    const ratingRepository = dataSource.getRepository("Rating");
    const savedRating = await ratingRepository.save(rating);

    const currentDate = new Date().toISOString().split("T")[0];

    const openingDateTime = new Date(`${currentDate}T${openingTime}:00+05:30`);
    const closingDateTime = new Date(`${currentDate}T${closingTime}:00+05:30`);
    // console.log(openingDateTime,closingDateTime,"going save")

    const restaurant = {
      id: restaurantId,
      restaurantName: restaurantName,
      restaurantAddress: restaurantAddress,
      restaurantImg: result.url,
      restaurantPassword: encodedPassword,
      restaurantStatus: "Closed",
      openingTime: openingDateTime,
      closingTime: closingDateTime,
      createdOn: new Date(),
      createdBy: restaurantName,
    };

    await restaurantRepository.save(restaurant);

    const accessToken = encrypt.generateToken({ id: restaurant.id });
    const refreshToken = encrypt.generateRefreshToken({ id: restaurant.id });

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = {
      id: cuid(),
      token: refreshToken,
      itemId: restaurant.id,
    };
    await tokenRepository.save(token);
    // console.log(restaurant,"daata")

    return res.status(201).json({
      message: "Restuarent created successfully",
      Data: restaurant,
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Restuarent creation failed" });
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
      return res.status(400).json({ message: "Invalid Password" });
    }

    const accessToken = encrypt.generateToken({ id: restaurant.id });
    const refreshToken = encrypt.generateRefreshToken({ id: restaurant.id });

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({
      message: "Restuarent Login Successfully",
      Data: restaurant,
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

    await new Promise((resolve, reject) => {
      upload.single("restaurantImg")(req, res, (err) => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
    console.log("anugsrsnns");

    const { id } = req.params;
    const restaurantRepository = dataSource.getRepository("Restaurant");
    console.log("2 dhjaaa");

    const restaurant = await restaurantRepository.findOne({ where: { id } });
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `Restaurant with this ID ${id} not found` });
    }

    let imageUrl = restaurant.restaurantImg;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.url;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    restaurant.restaurantName =
      req.body.restaurantName || restaurant.restaurantName;
    restaurant.restaurantImg = imageUrl || restaurant.restaurantImg;
    restaurant.restaurantStatus =
      req.body.restaurantStatus || restaurant.restaurantStatus;
    restaurant.openingTime = req.body.openingTime
      ? new Date(`${currentDate}T${req.body.openingTime}:00+05:30`)
      : restaurant.openingTime;
    restaurant.closingTime = req.body.closingTime
      ? new Date(`${currentDate}T${req.body.closingTime}:00+05:30`)
      : restaurant.closingTime;
    restaurant.modifiedBy = req.body.modifiedBy || restaurant.restaurantName;
    restaurant.modifiedOn = new Date();
    console.log(restaurant, "restaurant dataaaa");
 
    await restaurantRepository.save(restaurant);
    console.log("saved");

    return res.status(200).json({
      message: "Restaurant successfully updated",
      Data: restaurant,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update the restaurant" });
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
