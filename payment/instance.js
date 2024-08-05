const dotenv = require("dotenv");
const Razorpay = require("razorpay");
dotenv.config();
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_SECRET,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = { instance };
