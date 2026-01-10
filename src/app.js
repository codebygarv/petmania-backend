const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");


app.use(
  cors({
    origin: process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(",") 
      : ["http://localhost:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const connectionToMongoDb = require("./database/connection");
connectionToMongoDb();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const userRoutes = require("./modules/user/user.routes");

// Vercel has 4.5MB limit for serverless functions, but we'll allow slightly larger for base64 overhead
app.use(express.json({ limit: "4.5mb" }));
app.use(express.urlencoded({ extended: true, limit: "4.5mb" }));

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
