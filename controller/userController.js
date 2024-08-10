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

    const user = {
      id: cuid(),
      name: email.substring(0, email.indexOf("@")),
      email: email,
      password: encodedPassword,
      createdBy: email.substring(0, email.indexOf("@")),
      createdOn: new Date(),
    };

    var userRepository = dataSource.getRepository("User");
    userRepository.save(user);

    const accessToken = encrypt.generateToken({ id: user.id });
    const refreshToken = encrypt.generateRefreshToken({ id: user.id });

    const tokenRepository = dataSource.getRepository("RefreshToken");
    const token = {
      id: cuid(),
      token: refreshToken,
      itemId: user.id,
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
      where: { email },
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
    return res.status(200).json({
      meassage: "Login successfull",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(404).json({ message: "user signin failed" });
  }
}
async function searchByRestuarantOrFood(req, res) {
  try {
    const { query } = req.params;

    const restaurantRepository = dataSource.getRepository("Restaurant");
    const restaurant = await restaurantRepository.find({
      where: { restaurantName: ILike(`%${query}%`) },
    });

    if (restaurant.length > 0) {
      return res
        .status(200)
        .json({ message: "Success Restaurant", Data: restaurant });
    }

    const foodRepository = dataSource.getRepository("Food");
    const food = await foodRepository.find({
      where: { foodName: ILike(`%${query}%`) },
      relations: ["restaurant"],
    });

    if (food.length > 0) {
      const uniqueRestaurants = food
        .map(item => item.restaurant)

      return res
        .status(200)
        .json({ message: "Success Food", Data: uniqueRestaurants });
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

module.exports = {
  signUp,
  login,
  searchByRestuarantOrFood,
  createAccessToken,
};
