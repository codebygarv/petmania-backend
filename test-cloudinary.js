require("dotenv").config();
const cloudinary = require("./src/config/cloudinary");
const fs = require("fs");

async function test() {
  try {
    // Generate a tiny valid base64 image (1x1 pixel black PNG)
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    console.log("Starting upload test...");
    const result = await cloudinary.uploader.upload(base64Image, { timeout: 60000 });
    console.log("Success! URL:", result.secure_url);
  } catch (err) {
    console.error("Upload failed!");
    console.error(err);
  }
}
test();
