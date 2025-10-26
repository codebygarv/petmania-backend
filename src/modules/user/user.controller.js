const { emailService } = require("../../config/emailService");
const {
  otpGenerateTemplate,
} = require("../../config/emailTemplate/otpGenerationTemplate");
const { generateToken } = require("../../config/jwt");
const user = require("./user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const otpGenerate = require("../../config/otpGenerate");
const saveOtpToDB = require("../../config/saveOtpToDB");
const db = require("../../database/sqlConnection");

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: existingUser._id,
      email: existingUser.email,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: existingUser._id,
          email: existingUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userRegisterController = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      email: email.toLowerCase(),
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    await newUser.save();

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userForgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }
    const otp = otpGenerate();
    saveOtpToDB(existingUser.email, otp);

    await emailService.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: existingUser.email,
      subject: "OTP for Password Reset",
      html: otpGenerateTemplate(existingUser, otp),
    });

    res.status(200).json({
      success: true,
      message: "One time 4 digit otp is sent to the given email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const otpVerifyController = (req, res) => {
  const { email, otp } = req.body;

  db.get(
    `SELECT * FROM otp_store WHERE email = ? AND otp = ?`,
    [email, otp],
    async (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!row) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      if (Date.now() > row.expires_at) {
        // Delete expired OTP
        db.run(`DELETE FROM otp_store WHERE email = ?`, [email]);
        return res.status(400).json({ success: false, message: "OTP expired" });
      }

      // OTP is valid → delete from DB
      db.run(`DELETE FROM otp_store WHERE email = ?`, [email]);

      const tempToken = generateToken({ email, otpVerified: true }, "10m"); // valid for only 10 minutes and it's temperory 

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    }
  );
};

const userForgotPasswordControllerMain = async (req, res) => {
  try {
    const { password, confirmPassword, email } = req.body;

    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.confirmPassword = hashedPassword;
    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  userLoginController,
  userRegisterController,
  userForgotPasswordController,
  otpVerifyController,
  userForgotPasswordControllerMain,
};
