const { ILike } = require("typeorm");
const { dataSource } = require("../db/connection.js");
const Encrypt = require("../hepler/encrypt.js");
const { User } = require("../model/User.js");
const encrypt = new Encrypt();
const cuid = require("cuid");

async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;
    const encodedPassword = await encrypt.encryptPass(password);
    console.log(encodedPassword, "password is encoded");
    const userName = email.substring(0, email.indexOf("@"));
    const user = {
      id: cuid(),
      name: email.substring(0, email.indexOf("@")),
      email: email,
      password: encodedPassword,
    };
    console.log(user, "new user");

    var userRepository = dataSource.getRepository("User");
    userRepository.save(user);

    const token = encrypt.generateToken({ id: user.id });
    console.log(token, "token created");
    return res
      .status(201)
      .json({ message: "User created successfully", token, user });
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
    console.log(user, "from databse");

    console.log(user.password, "password from database");
    if (!user) {
      return res
        .status(401)
        .json({ message: `user not found with this ${email}` });
    }
    console.log(password, "i given");

    const isValidPassword = await encrypt.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = encrypt.generateToken({ id: user.id });
    return res.status(200).json({ meassage: "Login successfull", token });
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
        .json({ message: "Success Restuarant", Data: restaurant });
    }
    const foodRepository = dataSource.getRepository("Food");
    const food = await foodRepository.find({
      where: { foodName: ILike(`%${query}%`) },
    });
  
    if (food.length > 0) {
      return res.status(200).json({ message: "success food", Data: food });
    }
    return res.status(404).json({ message: "Not found", Data: [] });
  } catch (error) {
    return res.status(403).json({ message: "Failed" });
  }
}

module.exports = {
  signUp,
  login,
  searchByRestuarantOrFood,
};
