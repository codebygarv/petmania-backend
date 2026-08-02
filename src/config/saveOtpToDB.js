const UserOtp = require("../modules/user/models/userForgotOtp.model");

const saveOtpToDB = async (email, otp) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : email;
  await UserOtp.findOneAndUpdate(
    { email: normalizedEmail },
    { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
    { upsert: true, new: true }
  );
};

module.exports = saveOtpToDB;
