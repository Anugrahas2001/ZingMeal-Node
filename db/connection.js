// var typeorm = require("typeorm");
// const dotenv = require("dotenv");
// const { User } = require("../model/User.js");
// const { Restaurant } = require("../model/Restaurant.js");
// const { RefreshToken } = require("../model/RefreshToken.js");
// const { Food } = require("../model/Food.js");
// const { Rating } = require("../model/Rating.js");
// const { Order } = require("../model/Order.js");
// const { OrderItem } = require("../model/OrderItem.js");
// const { CartItem } = require("../model/CartItem.js");
// const { Cart } = require("../model/Cart.js");
// const { Payment } = require("../model/Payment.js");
// dotenv.config();

// const { DB_PORT } = process.env;
// var dataSource = new typeorm.DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(DB_PORT),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   synchronize: true,
//   logging: false,
//   entities: [
//     User,
//     Restaurant,
//     Food,
//     Rating,
//     RefreshToken,
//     Order,
//     OrderItem,
//     CartItem,
//     Cart,
//     Payment,
//   ],
// });

// module.exports = { dataSource };



const typeorm = require("typeorm");
const dotenv = require("dotenv");
dotenv.config();

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

const { DB_PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

// Check if environment variables are properly loaded
console.log("DB_HOST:", DB_HOST);
console.log("DB_PORT:", DB_PORT);
console.log("DB_USER:", DB_USER);


const dataSource = new typeorm.DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: true,
  logging: false,

  ssl: {
    rejectUnauthorized: false, // This is important if you are using services like Heroku or Render
  },
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

// Attempt to initialize the connection
dataSource.initialize().then(() => {
  console.log("Data source has been initialized successfully.");
}).catch((err) => {
  console.error("Error during Data Source initialization:", err);
});

module.exports = { dataSource };
