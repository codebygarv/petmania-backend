const mongoose = require("mongoose");

const userOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 5 * 60 * 1000, // 5 minutes
  },
});

module.exports = mongoose.model("UserOtp", userOtpSchema);
