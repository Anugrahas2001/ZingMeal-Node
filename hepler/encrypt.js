const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET = "" } = process.env;

class Encrypt {
 async encryptPass(password) {
    return bcrypt.hashSync(password, 12);
  }

 async comparePassword(password,hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
  }

  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }
}

module.exports = Encrypt;
