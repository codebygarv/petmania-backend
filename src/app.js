const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");


app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins to reflect back the requester's origin
      // This is necessary when credentials: true is used, as origin cannot be '*'
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  })
);

const connectionToMongoDb = require("./database/connection");
connectionToMongoDb();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const userRoutes = require("./modules/user/user.routes");
const petsRoutes = require("./modules/pets/pets.route");
const adminRoutes = require("./modules/admin/admin.routes");

// Vercel has 4.5MB limit for serverless functions, but we'll allow slightly larger for base64 overhead
app.use(express.json({ limit: "4.5mb" }));
app.use(express.urlencoded({ extended: true, limit: "4.5mb" }));

app.use("/api/user", userRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
