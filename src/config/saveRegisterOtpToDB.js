const OtpStore = require("../modules/user/models/userRegisterOtp.model");

const saveRegisterOtpToDB = async (email, otp) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : email;
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

  try {
    await OtpStore.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`OTP saved for ${normalizedEmail}`);
  } catch (err) {
    console.error("Error saving OTP to MongoDB:", err.message);
  }
};

module.exports = saveRegisterOtpToDB;
