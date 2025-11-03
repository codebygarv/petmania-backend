const OtpStore = require("../modules/user/models/userRegisterOtp.model");

const saveRegisterOtpToDB = async (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

  try {
    await OtpStore.deleteOne({ email, type: "register" });

    await OtpStore.create({
      email,
      otp,
      type: "register",
      expiresAt,
    });

    console.log(`OTP saved for ${email}`);
  } catch (err) {
    console.error("Error saving OTP to MongoDB:", err.message);
  }
};

module.exports = saveRegisterOtpToDB;
