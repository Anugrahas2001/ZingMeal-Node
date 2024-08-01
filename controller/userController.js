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
    // const userName = email.substring(0, email.indexOf("@"));
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

module.exports = {
  signUp,
  login,
};
