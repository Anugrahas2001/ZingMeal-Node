var typeorm = require("typeorm");
const dotenv = require("dotenv");
const { User } = require("../model/User.js");
const { Restaurant } = require("../model/Restaurant.js");
const { RefreshToken } = require("../model/RefreshToken.js");
const { Food } = require("../model/Food.js");
const { Rating } = require("../model/Rating.js");
const { Order } = require("../model/Order.js");
const { OrderItem } = require("../model/OrderItem.js");
const { CartItem } = require("../model/CartItem.js");
const { Cart } = require("../model/Cart.js");
const { Payment } = require("../model/Payment.js");
dotenv.config();

const { DB_PORT } = process.env;
var dataSource = new typeorm.DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Restaurant,
    Food,
    Rating,
    RefreshToken,
    Order,
    OrderItem,
    CartItem,
    Cart,
    Payment,
  ],
});

module.exports = { dataSource };
