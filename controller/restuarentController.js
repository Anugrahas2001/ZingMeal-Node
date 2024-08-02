const { dataSource } = require("../db/connection.js");
const { Restuarent } = require("../model/Restuarent.js");
const Encrypt = require("../hepler/encrypt.js");
const cloudinary = require("../cloudinary/cloudinary.js");
const upload = require("../middleware/multer.js");
const encrypt = new Encrypt();
const cuid = require("cuid");

async function signUp(req, res) {
  await new Promise((resolve, reject) => {
    upload.single("imageFile")(req, res, (err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
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

    const result = await cloudinary.uploader.upload(req.file.path);

    const restuarentId = cuid();

    const rating = {
      id: cuid(),
      itemId: restuarentId,
      itemRating: 1.0,
    };
    const ratingRepository = dataSource.getRepository("Rating");
    const savedRating = ratingRepository.save(rating);

    const restuarent = {
      id: restuarentId,
      restuarentName: restuarentName,
      restuarentImg: result.url,
      restuarentPassword: encodedPassword,
      restuarentStatus: "Closed",
      openingTime: new Date(openingTime),
      closingTime: new Date(closingTime),
      createdOn: new Date(),
      createdBy: restuarentName,
    };
    console.log(restuarent, "restuarent saved");

    const restuarentRepository = dataSource.getRepository("Restuarent");
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
async function deleteRestuarent(req, res) {
  try {
    const { id } = req.params;
    const restuarentRepository = dataSource.getRepository("Restuarent");
    const restuarent = await restuarentRepository.findOne({
      where: { id: id },
    });
    if (!restuarent) {
      return res
        .status(404)
        .json({ message: `Restuarent not found with this id ${id}` });
    }
    await restuarentRepository.remove(restuarent);
    return res.status(200).json({ message: "Restuarent succesffully deleted" });
  } catch (error) {
    return res.status(403).json({ message: "Failed to delete restuarent" });
  }
}

async function updateRestuarent(req, res) {
  try {
    const { id } = req.params;

    const restuarentRepository = dataSource.getRepository("Restuarent");
    const restuarent = await restuarentRepository.findOne({
      where: { id: id },
    });
    if (!restuarent) {
      return res
        .status(404)
        .json({ message: `Restuarent with this id ${id} not found` });
    }

    restuarent.restuarentName = req.body.restuarentName
      ? req.body.restuarentName
      : restuarent.restuarentName;

    restuarent.restuarentImg = req.body.restuarentImg
      ? req.body.restuarentImg
      : restuarent.restuarentImg;

    restuarent.restuarentRatings = req.body.restuarentRatings
      ? req.body.restuarentRatings
      : restuarent.restuarentRatings;

    restuarent.restuarentStatus = req.body.restuarentStatus
      ? req.body.restuarentStatus
      : restuarent.restuarentStatus;

    restuarent.openingTime = req.body.openingTime
      ? req.body.openingTime
      : restuarent.openingTime;

    restuarent.closingTime = req.body.closingTime
      ? req.body.closingTime
      : restuarent.closingTime;

    restuarent.modifiedBy = restuarent.restuarentName;
    restuarent.modifiedOn = new Date();

    await restuarentRepository.save(restuarent);
    return res.status(200).json({
      message: "Resturent successfully updated",
      Data: restuarent,
    });
  } catch (error) {
    return res.status(403).json({ message: "Failed update the restuarent" });
  }
}

async function getAllRestuarents(req, res) {
  try {
    const restuarentRepository = dataSource.getRepository("Restuarent");
    const allRestuarents = await restuarentRepository.find({});

    return res.status(200).json({
      message: "Successfully retrieved all restuarents",
      Data: allRestuarents,
    });
  } catch (error) {
    return res.status(403).json({ message: "Failed to retrieve restuarents" });
  }
}

module.exports = {
  signUp,
  login,
  getAllRestuarents,
  updateRestuarent,
  deleteRestuarent,
};
