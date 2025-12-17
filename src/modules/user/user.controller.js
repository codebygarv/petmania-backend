const { emailService } = require("../../config/emailService");
const {
  otpGenerateTemplate,
} = require("../../config/emailTemplate/otpGenerationTemplate");
const { generateToken } = require("../../config/jwt");
const user = require("./models/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const otpGenerate = require("../../config/otpGenerate");
const saveOtpToDB = require("../../config/saveOtpToDB");
const db = require("../../database/sqlConnection");
const saveRegisterOtpToDB = require("../../config/saveRegisterOtpToDB");
const {
  RegisterOtpTemplate,
  registrationOtpTemplate,
} = require("../../config/emailTemplate/RegisterOtpTemplate");
const RegisterOtp = require("./models/userRegisterOtp.model");
const UserOtp = require("./models/userForgotOtp.model");

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
        },
      });
    }

    const token = generateToken({
      userId: existingUser._id,
      email: existingUser.email,
    });

    res
      .status(200)
      // .cookie("token", token, {
      //   httpOnly: true, // Secure: prevents access from frontend JS
      //   secure: true, // Set true in production with HTTPS
      //   sameSite: "strict",
      // })
      .json({
        success: true,
        message: "Login successful",
        data: {
          token: token,
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
      error: {
        message: "Internal server error",
      },
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
        error: {
          message: "Email already in use",
        },
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      email: email.toLowerCase(),
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    const otp = otpGenerate();
    saveRegisterOtpToDB(newUser.email, otp);

    await emailService.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "OTP for Password Reset",
      html: registrationOtpTemplate(newUser, otp),
    });

    await newUser.save();
    res
      .status(201)

      .json({
        success: true,
        message: "User registered successfully",
        data: {
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
      error: {
        message: "Internal server error",
      },
    });
  }
};

const userRegisterOtpController = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const existingOtp = await RegisterOtp.findOne({ email, otp });

    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid OTP" },
      });
    }

    if (Date.now() > new Date(existingOtp.expiresAt)) {
      await RegisterOtp.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const token = generateToken({ email });

    await RegisterOtp.deleteOne({ email });

    return res
      .status(200)
      // .cookie("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "strict",
      // })
      .json({
        success: true,
        message: "OTP verified successfully",
        data: {
          token: token,
        },
      });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

const userDetailsController = async (req, res) => {
  try {
    const email = req.email;
    const userDetails = await user.findOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      message: "Details Fetched Successfully",
      data: {
        user: {
          id: userDetails._id,
          email: userDetails.email,
        },
      },
    });
  } catch (error) {
    console.error("details fetching  error:", error);
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
        error: {
          message: "User with this email does not exist",
        },
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
      error: {
        message: "Internal server error",
      },
    });
  }
};

const userForgotPasswordotpVerifyController = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const existingOtp = await UserOtp.findOne({ email, otp });

    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid OTP" },
      });
    }

    if (Date.now() > new Date(existingOtp.expiresAt)) {
      await UserOtp.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await UserOtp.deleteOne({ email });

    const tempToken = generateToken({ email, otpVerified: true }, "10m");

    return res
      .status(200)
      // .cookie("otpToken", tempToken, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "strict",
      //   maxAge: 5 * 60 * 1000,
      // })
      .json({
        success: true,
        message: "OTP verified successfully",
        data: {
          token: tempToken,
        },
      });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

const userForgotPasswordControllerMain = async (req, res) => {
  try {
    const email = req.email;
    const { password, confirmPassword } = req.body;

    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User with this email does not exist",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.confirmPassword = hashedPassword;
    await existingUser.save();

    // res.clearCookie("otpToken", {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "strict",
    // });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
};

module.exports = {
  userLoginController,
  userRegisterController,
  userRegisterOtpController,
  userForgotPasswordController,
  userForgotPasswordotpVerifyController,
  userForgotPasswordControllerMain,
  userDetailsController,
};
