const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const connectionToMongoDb = require("./database/connection");
connectionToMongoDb();

const otpGenerate = require("./config/otpGenerate");
const userRoutes = require("./modules/user/user.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
