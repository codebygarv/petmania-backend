const mongoose = require("mongoose");

const registerOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  otp: { type: String, required: true },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // expires in 10 minutes
  },
});

registerOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RegisterOtp", registerOtpSchema);
