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

    // Convert openingTime to 24-hour format
    let [openingHour, openingMinutes] = openingTime.split(":").map(Number);
    if (openingHour === 12) {
      openingHour = 0; // Convert 12 AM to 00:00
    }
    if (openingHour < 12) {

    } else {
      openingHour -= 12;
    }
    const formattedOpeningTime = `${openingHour
      .toString()
      .padStart(2, "0")}:${openingMinutes.toString().padStart(2, "0")}`;

    let [closingHour, closingMinutes] = closingTime.split(":").map(Number);
    if (closingHour === 12) {
      closingHour = 12; // 12 PM remains 12:00
    } else if (closingHour < 12) {
      closingHour += 12; // Convert AM hours to PM (except 12 AM)
    }
    const formattedClosingTime = `${closingHour
      .toString()
      .padStart(2, "0")}:${closingMinutes.toString().padStart(2, "0")}`;

    const openingDateTime = new Date(
      `${currentDate}T${formattedOpeningTime}:00+05:30`
    );
    const closingDateTime = new Date(
      `${currentDate}T${formattedClosingTime}:00+05:30`
    );

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

    return res.status(201).json({
      message: "Restuarent created successfully",
      Data: restaurant,
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
    console.log(restaurantName, restaurantPassword, "credentials");

    if (!restaurantName || !restaurantPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { restaurantName },
    });
    console.log(restaurant, "hotel");
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
    console.log(accessToken, refreshToken, "token");
    const tokenRepository = dataSource.getRepository("RefreshToken");

    const tokenData = await tokenRepository.findOne({
      where: { itemId: restaurant.id },
    });
    console.log(tokenData, "data from token");
    if (!tokenData) {
      console.log("token is not there");
      const token = {
        id: cuid(),
        token: refreshToken,
        itemId: restaurant.id,
        createdBy: restaurant.restaurantName,
        createdOn: new Date(),
      };
      await tokenRepository.save(token);
      console.log(token, "saved");
      return res.status(200).json({
        meassage: "Login successfull",
        Data: restaurant,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }

    tokenData.token = refreshToken;
    tokenData.modifiedBy = restaurant.restaurantName;
    tokenData.modifiedOn = new Date();

    await tokenRepository.save(tokenData);
    console.log("Refresh token updated and saved");

    return res.status(200).json({
      message: "Restuarent Login Successfully",
      Data: restaurant,
      accessToken: accessToken,
      refreshToken: refreshToken,
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

    const { id } = req.params;
    const restaurantRepository = dataSource.getRepository("Restaurant");

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

    if (req.body.openingTime) {
      let [openingHour, openingMinutes] = req.body.openingTime
        .split(":")
        .map(Number);

      openingMinutes = isNaN(openingMinutes) ? 0 : openingMinutes;

      if (openingHour === 12) openingHour = 0;

      if (openingHour < 0 || openingHour > 12) {
        return res.status(400).json({ message: "Invalid opening hour" });
      }

      const formattedOpeningTime = `${openingHour
        .toString()
        .padStart(2, "0")}:${openingMinutes.toString().padStart(2, "0")}`;
      restaurant.openingTime = new Date(
        `${currentDate}T${formattedOpeningTime}:00+05:30`
      );
    }

    if (req.body.closingTime) {
      let [closingHour, closingMinutes] = req.body.closingTime
        .split(":")
        .map(Number);

      closingMinutes = isNaN(closingMinutes) ? 0 : closingMinutes;

      if (closingHour < 12) closingHour += 12;
      if (closingHour === 24) closingHour = 12;

      if (closingHour < 12 || closingHour > 23) {
        return res.status(400).json({ message: "Invalid closing hour" });
      }

      const formattedClosingTime = `${closingHour
        .toString()
        .padStart(2, "0")}:${closingMinutes.toString().padStart(2, "0")}`;
      restaurant.closingTime = new Date(
        `${currentDate}T${formattedClosingTime}:00+05:30`
      );
    }

    restaurant.modifiedBy = req.body.modifiedBy || restaurant.restaurantName;
    restaurant.modifiedOn = new Date();

    await restaurantRepository.save(restaurant);

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

async function logOut(req, res) {
  try {
    const { id } = req.params;
    console.log(id, "idddd");

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.findOne({
      where: { id: id },
    });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    console.log(restaurant, "restaurantttt");
    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = await tokenRepository.findOne({
      where: { itemId: id },
    });
    console.log(token, "refresh tokennn");
    await tokenRepository.remove(token);
    return res.status(200).json({ message: "user logout successfully" });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  signUp,
  login,
  logOut,
  getAllRestuarents,
  updateRestuarent,
  deleteRestuarent,
  getRestaurantById,
};
