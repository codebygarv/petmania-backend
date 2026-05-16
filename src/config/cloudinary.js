const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbsydkltg",
  api_key: process.env.CLOUDINARY_API_KEY || "377567727838336",
  api_secret: process.env.CLOUDINARY_API_SECRET || "2BcXw-4ReWBiTEfERFDPboC6mV8",
});

module.exports = cloudinary;
