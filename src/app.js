const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
app.use(cors());


const connectionToMongoDb = require("./database/connection");
connectionToMongoDb();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const userRoutes = require("./modules/user/user.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
