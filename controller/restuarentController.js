const { dataSource } = require("../db/connection.js");
const { Restuarent } = require("../model/Restuarent.js");
const Encrypt = require("../hepler/encrypt.js");
const encrypt = new Encrypt();
const cuid = require("cuid");

async function signUp(req, res) {
  try {
    const {
      restuarentName,
      restuarentImg,
      restuarentPassword,
      openingTime,
      closingTime,
    } = req.body;
    const encodedPassword = await encrypt.encryptPass(restuarentPassword);
    console.log(encodedPassword, "password is encoded");

    const restuarent = {
      id: cuid(),
      restuarentName: restuarentName,
      restuarentImg: restuarentImg,
      restuarentPassword: encodedPassword,
      restuarentRatings: 1.0,
      restuarentStatus: "Closed",
      openingTime: openingTime,
      closingTime: closingTime,
      createdOn:new Date(),
      createdBy:restuarentName
    };
    console.log(restuarent, "restuarent saved");

    const restuarentRepository = dataSource.getRepository("Restuarent");
    console.log(restuarentRepository,"repository")
    restuarentRepository.save(restuarent);

    console.log("going to genarate token");

    const token = encrypt.generateToken({ id: restuarent.id });
    console.log(token, "token created");
    return res
      .status(201)
      .json({ message: "Restuarent created successfully", token });
  } catch (error) {
    return res.status(403).json({ message: "Restuarent creation failed" });
  }
}

async function login(req, res) {
  try {
    const { restuarentName, restuarentPassword } = req.body;

    if (!restuarentName || !restuarentPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const restuarentRepository = dataSource.getRepository("Restuarent");
    const restuarent = await restuarentRepository.findOne({
      where: { restuarentName },
    });

    const isValidPassword = await encrypt.comparePassword(
      restuarentPassword,
      restuarent.restuarentPassword
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = encrypt.generateToken({ id: restuarent.id });
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res
      .status(200)
      .json({ message: "Restuarent Login Successfully", token });
  } catch (error) {
    return res.status(403).json({ message: "Login failed" });
  }
}

module.exports = { signUp, login };
