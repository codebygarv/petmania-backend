const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI_TEMP; 

const connectionToMongoDb = async () => {
  await mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Database is connected");
    })
    .catch((error) => {
      console.log("Error during connected mongodb", error);
    });
};

module.exports = connectionToMongoDb;
