const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
      minlength: 6,
    },
    confirmPassword: {
      type: String,
    },
    passwordChangeCount: {
      type: Number,
      default: 0,
    },
    googleId: {
      type: String,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    userVerified: {
      type: Boolean,
      default: false,
    },
    Gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    dateOfBirth: {
      type: Date,
    },
    pinCode: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    UserManualAddress: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    adharCardFrontImage: {
      type: String,
    },
    adharCardBackImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOtpSubmitted: {
      type: Boolean,
      default: false,
    },
    otpRequestCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);

module.exports = user;
