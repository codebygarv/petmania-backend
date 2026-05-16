const UserOtp = require("../modules/user/models/userForgotOtp.model");

const saveOtpToDB = async (email, otp) => {
  await UserOtp.findOneAndUpdate(
    { email },
    { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
    { upsert: true, new: true }
  );
};

module.exports = saveOtpToDB;
