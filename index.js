const express = require("express");
const { dataSource } = require("./db/connection.js");
const { userRouter } = require("./router/userRouter.js");
const { restuarentRouter } = require("./router/restuarentRouter.js");
var bodyParser = require('body-parser');
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();
PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors({
//   origin: 'http://localhost:5173'
// }));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use('/user', userRouter); 
app.use("/restaurant", restuarentRouter);

app.listen(PORT, () => {
  console.log(`server started at post ${PORT}`);
});
dataSource
  .initialize()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => console.log("An error occured", err));
