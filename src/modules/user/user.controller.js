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
const cloudinary = require("../../config/cloudinary");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const client = new OAuth2Client(
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Helper function to check if string is a Cloudinary URL
const isCloudinaryUrl = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.includes("res.cloudinary.com") || str.startsWith("http");
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<extension>
    // or: https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>.<extension>
    const parts = url.split("/upload/");
    if (parts.length > 1) {
      const afterUpload = parts[1];
      // Remove version prefix (v123456/) if present
      const withoutVersion = afterUpload.replace(/^v\d+\//, "");
      // Remove file extension and any query parameters
      const publicId = withoutVersion.split(".")[0].split("?")[0];
      return publicId;
    }
    return null;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

// Helper function to validate image size (base64)
const validateImageSize = (base64String, maxSizeMB = 4) => {
  if (!base64String) return { valid: true };

  // Approximate size: base64 is ~33% larger than binary
  const sizeInBytes = (base64String.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    return {
      valid: false,
      message: `Image size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true, sizeInMB };
};

// Login Controller
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


    if (!existingUser.isOtpSubmitted) {
      if (existingUser.otpRequestCount >= 3) {
        return res.status(429).json({
          success: false,
          error: {
            message: "Too many attempts. You have requested an OTP 3 times without verifying.",
          },
        });
      }

      existingUser.otpRequestCount = (existingUser.otpRequestCount || 0) + 1;
      await existingUser.save();

      // generate the otp again 
      const otp = otpGenerate();
      saveRegisterOtpToDB(existingUser.email, otp);

      await emailService.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: existingUser.email,
        subject: "OTP for Email Verification Again",
        html: registrationOtpTemplate(existingUser, otp),
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
          user: existingUser,
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

// Google Login Controller
const userGoogleLoginController = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Access Token missing" });
    }

    // 🔥 Get user info from Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { sub: googleId, email, name, picture } = googleRes.data;

    if (!email) {
      return res.status(401).json({ message: "Invalid Google access token" });
    }

    let existingUser = await user.findOne({ email });

    if (!existingUser) {
      existingUser = await user.create({
        email,
        googleId,
        name,
        avatar: picture,
        isGoogleUser: true,
      });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        token,
        user: {
          id: existingUser._id,
          email,
          name,
          avatar: picture,
        },
      },
    });
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

// Register Controller - register user and send otp to user email
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
      otpRequestCount: 1,
    });

    const otp = otpGenerate();
    saveRegisterOtpToDB(newUser.email, otp);

    await emailService.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "OTP for Email Verification",
      html: registrationOtpTemplate(newUser, otp),
    });

    await newUser.save();

    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
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

// Register OTP Controller - sent otp to user email
const userRegisterOtpController = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const existingOtp = await RegisterOtp.findOne({ email, otp });

    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid OTP" },
      });
    }

    if (Date.now() > new Date(existingOtp.expiresAt)) {
      await RegisterOtp.deleteOne({ email });
      return res.status(400).json({
        success: false,
        error: { message: "OTP expired" },
      });
    }

    existingUser.isOtpSubmitted = true;
    existingUser.isVerified = false;
    existingUser.otpRequestCount = 0;
    await existingUser.save();

    const token = generateToken({ email: existingUser.email });

    await RegisterOtp.deleteOne({ email });

    return (
      res
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
            user: existingUser
          },
        })
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// User Details Controller
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
          name: userDetails.name,
          phoneNumber: userDetails.phoneNumber,
          Gender: userDetails.Gender,
          dateOfBirth: userDetails.dateOfBirth,
          pinCode: userDetails.pinCode,
          city: userDetails.city,
          state: userDetails.state,
          UserManualAddress: userDetails.UserManualAddress,
          profileImage: userDetails.profileImage,
          adharCardNumber: userDetails.adharCardNumber,
          adharCardFrontImage: userDetails.adharCardFrontImage,
          adharCardBackImage: userDetails.adharCardBackImage,
          userVerified: userDetails.userVerified,
          isVerified: userDetails.isVerified,
          isOtpSubmitted: userDetails.isOtpSubmitted,
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

// User Update Details Controller
const userUpdateDetailsController = async (req, res) => {
  try {
    const email = req.email;

    const {
      profileImage,
      adharCardFrontImage,
      adharCardBackImage,
      ...otherData
    } = req.body;

    const existingUser = await user.findOne({
      email: email?.toLowerCase(),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatePayload = { ...otherData };

    // Handle empty dateOfBirth to prevent Mongoose CastError
    if (updatePayload.dateOfBirth === "") {
      updatePayload.dateOfBirth = null;
    }

    /* ---------------- PROFILE IMAGE ---------------- */
    if (profileImage && profileImage !== existingUser.profileImage) {
      // Check if image is already a Cloudinary URL
      if (isCloudinaryUrl(profileImage)) {
        // If it's already a Cloudinary URL, just use it
        updatePayload.profileImage = profileImage;
        // Delete old image if different
        if (existingUser.profileImage && existingUser.profileImage !== profileImage) {
          try {
            const publicId = getPublicIdFromUrl(existingUser.profileImage);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (err) {
            console.error(
              "Error deleting old profile image from Cloudinary:",
              err
            );
          }
        }
      } else {
        // It's a base64 string, validate size first
        const sizeValidation = validateImageSize(profileImage, 4);
        if (!sizeValidation.valid) {
          return res.status(413).json({
            success: false,
            message: sizeValidation.message,
          });
        }

        try {
          const upload = await cloudinary.uploader.upload(profileImage, {
            timeout: 60000, // 60 seconds timeout for Vercel
          });
          updatePayload.profileImage = upload.secure_url;

          // Delete old image after successful upload
          if (existingUser.profileImage) {
            try {
              const publicId = getPublicIdFromUrl(existingUser.profileImage);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            } catch (err) {
              console.error(
                "Error deleting old profile image from Cloudinary:",
                err
              );
            }
          }
        } catch (err) {
          console.error("Error uploading profile image to Cloudinary:", err);
          return res.status(500).json({
            success: false,
            message: err.message || "Failed to upload profile image. Please try again.",
          });
        }
      }
    }

    /* ---------------- AADHAR FRONT ---------------- */
    if (
      adharCardFrontImage &&
      adharCardFrontImage !== existingUser.adharCardFrontImage
    ) {
      // Check if image is already a Cloudinary URL
      if (isCloudinaryUrl(adharCardFrontImage)) {
        updatePayload.adharCardFrontImage = adharCardFrontImage;
        if (existingUser.adharCardFrontImage && existingUser.adharCardFrontImage !== adharCardFrontImage) {
          try {
            const publicId = getPublicIdFromUrl(existingUser.adharCardFrontImage);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (err) {
            console.error(
              "Error deleting old adhar card front image from Cloudinary:",
              err
            );
          }
        }
      } else {
        const sizeValidation = validateImageSize(adharCardFrontImage, 4);
        if (!sizeValidation.valid) {
          return res.status(413).json({
            success: false,
            message: sizeValidation.message,
          });
        }

        try {
          const upload = await cloudinary.uploader.upload(adharCardFrontImage, {
            timeout: 60000,
          });
          updatePayload.adharCardFrontImage = upload.secure_url;

          if (existingUser.adharCardFrontImage) {
            try {
              const publicId = getPublicIdFromUrl(
                existingUser.adharCardFrontImage
              );
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            } catch (err) {
              console.error(
                "Error deleting old adhar card front image from Cloudinary:",
                err
              );
            }
          }
        } catch (err) {
          console.error(
            "Error uploading adhar card front image to Cloudinary:",
            err
          );
          return res.status(500).json({
            success: false,
            message: err.message || "Failed to upload adhar card front image. Please try again.",
          });
        }
      }
    }

    /* ---------------- AADHAR BACK ---------------- */
    if (
      adharCardBackImage &&
      adharCardBackImage !== existingUser.adharCardBackImage
    ) {
      // Check if image is already a Cloudinary URL
      if (isCloudinaryUrl(adharCardBackImage)) {
        updatePayload.adharCardBackImage = adharCardBackImage;
        if (existingUser.adharCardBackImage && existingUser.adharCardBackImage !== adharCardBackImage) {
          try {
            const publicId = getPublicIdFromUrl(existingUser.adharCardBackImage);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (err) {
            console.error(
              "Error deleting old adhar card back image from Cloudinary:",
              err
            );
          }
        }
      } else {
        const sizeValidation = validateImageSize(adharCardBackImage, 4);
        if (!sizeValidation.valid) {
          return res.status(413).json({
            success: false,
            message: sizeValidation.message,
          });
        }

        try {
          const upload = await cloudinary.uploader.upload(adharCardBackImage, {
            timeout: 60000,
          });
          updatePayload.adharCardBackImage = upload.secure_url;

          if (existingUser.adharCardBackImage) {
            try {
              const publicId = getPublicIdFromUrl(
                existingUser.adharCardBackImage
              );
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            } catch (err) {
              console.error(
                "Error deleting old adhar card back image from Cloudinary:",
                err
              );
            }
          }
        } catch (err) {
          console.error(
            "Error uploading adhar card back image to Cloudinary:",
            err
          );
          return res.status(500).json({
            success: false,
            message: err.message || "Failed to upload adhar card back image. Please try again.",
          });
        }
      }
    }

    const updatedUser = await user.findOneAndUpdate(
      { email: email?.toLowerCase() },
      updatePayload,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Details Updated Successfully",
      data: {
        user: updatedUser,
      },
    });
    } catch (error) {
    console.error("Update details error detailed:", {
      message: error.message,
      stack: error.stack,
      errors: error.errors // Mongoose validation errors
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message // Sending error message to frontend for easier debugging
    });
  }
};

// User Forgot Password Controller
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

// User Forgot Password OTP Verify Controller

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

    const tempToken = generateToken({ email: email.toLowerCase(), otpVerified: true }, "10m");

    return (
      res
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
        })
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// User Forgot Password Main Controller
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
    existingUser.passwordChangeCount = existingUser.passwordChangeCount + 1;
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

// User Reset Password Controller (from profile settings)
const userResetPasswordController = async (req, res) => {
  try {
    const email = req.email;
    const { oldPassword, password, confirmPassword } = req.body;

    const existingUser = await user.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
        },
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Current password is incorrect",
        },
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.confirmPassword = hashedPassword;
    existingUser.passwordChangeCount = (existingUser.passwordChangeCount || 0) + 1;
    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
};

// User Delete Controller
const userDeleteController = async (req, res) => {
  try {
    const email = req.email;
    const deletedUser = await user.findOneAndDelete({ email: email?.toLowerCase() });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Delete user's images from Cloudinary could be added here later
    // if needed.

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User Toggle Favourite Controller
const toggleFavouriteController = async (req, res) => {
  try {
    const email = req.email;
    const { petId } = req.body;

    if (!petId) {
      return res.status(400).json({ success: false, message: "Pet ID is required" });
    }

    const existingUser = await user.findOne({ email: email?.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isFavourite = existingUser.favourites.includes(petId);

    if (isFavourite) {
      existingUser.favourites = existingUser.favourites.filter(id => id.toString() !== petId.toString());
    } else {
      existingUser.favourites.push(petId);
    }

    await existingUser.save();
    await existingUser.populate('favourites');

    return res.status(200).json({
      success: true,
      message: isFavourite ? "Removed from favourites" : "Added to favourites",
      data: {
        favourites: existingUser.favourites,
      },
    });
  } catch (error) {
    console.error("Toggle favourite error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// User Get Favourites Controller
const getFavouritesController = async (req, res) => {
  try {
    const email = req.email;
    const existingUser = await user.findOne({ email: email?.toLowerCase() }).populate('favourites');

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Favourites fetched successfully",
      data: {
        favourites: existingUser.favourites,
      },
    });
  } catch (error) {
    console.error("Get favourites error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
  userResetPasswordController,
  userDetailsController,
  userGoogleLoginController,
  userUpdateDetailsController,
  userDeleteController,
  toggleFavouriteController,
  getFavouritesController,
};
