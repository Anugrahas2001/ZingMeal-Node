const express = require("express");
const { dataSource } = require("./db/connection.js");
const { userRouter } = require("./router/userRouter.js");
const { restuarentRouter } = require("./router/restuarentRouter.js");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Use the built-in express body parser for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
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

// Log request time and route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Request received at: ${new Date().toISOString()}`);
  next();
});

// Log response time
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (data) {
    console.log(`${req.method} ${req.url} - Response sent at: ${new Date().toISOString()}`);
    oldSend.apply(res, arguments);
  };
  next();
});

// Routers
app.use("/user", userRouter);
app.use("/restaurant", restuarentRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

// Initialize database connection
dataSource
  .initialize()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.log("An error occurred during database initialization", err);
  });
