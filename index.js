const express = require("express");
const { dataSource } = require("./db/connection.js");
const { userRouter } = require("./router/userRouter.js");
const { restuarentRouter } = require("./router/restuarentRouter.js");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://zingmeal.netlify.app",
  "https://zing-meal-app-site-git-anugraha-anugraha-ss-projects.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/user", userRouter);
app.use("/restaurant", restuarentRouter);

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

dataSource
  .initialize()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.log("An error occurred during database initialization", err);
  });
