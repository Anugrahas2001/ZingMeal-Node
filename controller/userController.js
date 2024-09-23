const { ILike } = require("typeorm");
const { dataSource } = require("../db/connection.js");
const Encrypt = require("../hepler/encrypt.js");
const { User } = require("../model/User.js");
const encrypt = new Encrypt();
const cuid = require("cuid");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

async function signUp(req, res) {
  try {
    const { email, password } = req.body;
    const encodedPassword = await encrypt.encryptPass(password);

    const userRepository = dataSource.getRepository("User");
    const userFromDb = await userRepository.findOne({
      where: { email: email },
    });

    if (userFromDb) {
      return res
        .status(400)
        .json({ message: "User with this email is already present" });
    }

    const user = {
      id: cuid(),
      name: email.substring(0, email.indexOf("@")),
      email: email,
      password: encodedPassword,
      createdBy: email.substring(0, email.indexOf("@")),
      createdOn: new Date(),
    };

    userRepository.save(user);

    const accessToken = encrypt.generateToken({ id: user.id });
    const refreshToken = encrypt.generateRefreshToken({ id: user.id });

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = {
      id: cuid(),
      token: refreshToken,
      itemId: user.id,
      createdBy: email.substring(0, email.indexOf("@")),
      createdOn: new Date(),
    };
    await tokenRepository.save(token);

    return res.status(201).json({
      message: "User created successfully",
      user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(404).json({ message: "user signUp failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: `user not found with this ${email}` });
    }

    const isValidPassword = await encrypt.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = encrypt.generateToken({ id: user.id });
    const refreshToken = encrypt.generateRefreshToken({ id: user.id });

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const tokenData = await tokenRepository.findOne({
      where: { itemId: user.id },
    });

    if (!tokenData) {
      const token = {
        id: cuid(),
        token: refreshToken,
        itemId: user.id,
        createdBy: email.substring(0, email.indexOf("@")),
        createdOn: new Date(),
      };
      await tokenRepository.save(token);

      return res.status(200).json({
        meassage: "Login successfull",
        Data: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }

    tokenData.token = refreshToken;
    tokenData.modifiedBy = user.name;
    tokenData.modifiedOn = new Date();

    await tokenRepository.save(tokenData);

    return res.status(200).json({
      message: "Login successfull",
      Data: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "user signin failed" });
  }
}

async function searchByRestuarantOrFood(req, res) {
  try {
    const { query } = req.params;
    const uniqueRestaurantsMap = new Map();

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurants = await restaurantRepository.find({
      where: { restaurantName: ILike(`%${query}%`) },
    });

    if (restaurants.length > 0) {
      restaurants.forEach((restaurant) => {
        uniqueRestaurantsMap.set(restaurant.id, restaurant);
      });

      const restaurantsArray = Array.from(uniqueRestaurantsMap.values());

      return res
        .status(200)
        .json({ message: "Success Restaurant", Data: restaurantsArray });
    }

    const foodRepository = dataSource.getRepository("Food");
    const foods = await foodRepository.find({
      where: { foodName: ILike(`%${query}%`) },
      relations: ["restaurant"],
    });

    if (foods.length > 0) {
      foods.forEach((food) =>
        uniqueRestaurantsMap.set(food.restaurant.id, food.restaurant)
      );
      const restaurantsArray = Array.from(uniqueRestaurantsMap.values());

      return res
        .status(200)
        .json({ message: "Success Food", Data: restaurantsArray });
    }

    return res.status(404).json({ message: "Not found", Data: [] });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Failed" });
  }
}

async function createAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(404).json({ message: "Refresh token not found" });
  }

  const refreshTokenRepository = dataSource.getRepository("RefreshToken");
  const token = await refreshTokenRepository.findOne({
    where: { id: refreshToken.id },
  });

  if (!token) {
    return res.status(404).json({ message: "Refresh token not found" });
  }

  jwt.verify(token.token, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAccessToken = encrypt.generateToken({ id: token.itemId });
    const refreshToken = encrypt.generateRefreshToken({ id: token.itemId });
    token.token = refreshToken;
    await refreshTokenRepository.save(token);

    return res
      .status(200)
      .json({ AccessToken: newAccessToken, RefeshToken: refreshToken });
  });
}

async function logOut(req, res) {
  try {
    const { id } = req.params;

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = await tokenRepository.findOne({
      where: { itemId: id },
    });

    await tokenRepository.remove(token);
    return res.status(200).json({ message: "user logout successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to log out" });
  }
}

async function newPassword(req, res) {
  try {
    const { userId } = req.params;

    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (req.body.password) {
      const encodedPassword = await encrypt.encryptPass(req.body.password);
      user.password = encodedPassword;
    }

    await userRepository.save(user);

    return res
      .status(200)
      .json({ message: "user password updated successfully", Data: user });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  signUp,
  login,
  searchByRestuarantOrFood,
  createAccessToken,
  logOut,
  newPassword,
};
