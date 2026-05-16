const OtpStore = require("../modules/user/models/userRegisterOtp.model");

const saveRegisterOtpToDB = async (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

  try {
    await OtpStore.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`OTP saved for ${email}`);
  } catch (err) {
    console.error("Error saving OTP to MongoDB:", err.message);
  }
};

module.exports = saveRegisterOtpToDB;
