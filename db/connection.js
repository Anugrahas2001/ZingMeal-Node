var typeorm = require("typeorm");
const dotenv = require("dotenv");
const { User } = require("../model/User.js");
const { Restuarent } = require("../model/Restuarent.js");
const { Food } = require("../model/Food.js");
const { Rating } = require("../model/Rating.js");
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
  entities: [User, Restuarent, Food, Rating],
});

module.exports = { dataSource };
