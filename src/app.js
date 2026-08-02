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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Vercel has 4.5MB limit for serverless functions, but we'll allow slightly larger for base64 overhead
app.use(express.json({ limit: "4.5mb" }));
app.use(express.urlencoded({ extended: true, limit: "4.5mb" }));

// Ensure MongoDB connection is established for all API requests
app.use(async (req, res, next) => {
  if (req.path === "/" || req.path === "/api") {
    return next();
  }
  try {
    await connectionToMongoDb();
    next();
  } catch (error) {
    console.error("[Database Connection Error]:", error.message);
    if (req.path.includes("/auth/google/callback")) {
      const returnBase = req.query.state
        ? decodeURIComponent(req.query.state)
        : "petmania://google-auth";
      const separator = returnBase.includes("#") ? "&" : "#";
      return res.redirect(
        302,
        `${returnBase}${separator}error=${encodeURIComponent(
          "Database connection error. Please try logging in again."
        )}`
      );
    }
    return res.status(503).json({
      success: false,
      error: { message: "Database connection failed. Please try again." },
    });
  }
});

const userRoutes = require("./modules/user/user.routes");
const petsRoutes = require("./modules/pets/pets.route");
const adminRoutes = require("./modules/admin/admin.routes");

app.use("/api/user", userRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Petmania API is running",
  });
});

module.exports = app;
