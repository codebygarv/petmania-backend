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
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    passwordChangeCount: {
      type: Number,
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
    AdhardCardImage: {
      type: String,
    },

  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);

module.exports = user;