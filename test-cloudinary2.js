require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Let's force the one WITHOUT the 's' that matches CLOUDINARY_URL
cloudinary.config({
  cloud_name: "dqbcyecks",
  api_key: "377567727838336",
  api_secret: "2BcXw-4ReWBiTEfERFDPboC6mV8", // removed 's'
});

async function test() {
  try {
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    console.log("Testing secret without 's'...");
    const result = await cloudinary.uploader.upload(base64Image, { timeout: 60000 });
    console.log("Success! URL:", result.secure_url);
  } catch (err) {
    console.error("Upload failed with secret 1!");
    console.error(err.message);

    console.log("\nTesting secret with 's'...");
    cloudinary.config({
      cloud_name: "dqbcyecks",
      api_key: "377567727838336",
      api_secret: "2BcXw-4ReWBiTEfERFDPboC6mVs8", // with 's'
    });
    
    try {
      const result2 = await cloudinary.uploader.upload(base64Image, { timeout: 60000 });
      console.log("Success! URL:", result2.secure_url);
    } catch(err2) {
      console.error("Upload failed with secret 2!");
      console.error(err2.message);
    }
  }
}
test();
