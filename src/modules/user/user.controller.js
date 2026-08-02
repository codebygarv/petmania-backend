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
        isVerified: true,
        isAdharVerified: false,
        userVerified: false,
      });
    } else if (!existingUser.googleId) {
      existingUser.googleId = googleId;
      existingUser.isGoogleUser = true;
      existingUser.isVerified = true;
      if (picture && !existingUser.avatar) existingUser.avatar = picture;
      await existingUser.save();
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
          avatar: picture || existingUser.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

// Google OAuth Authorization Code Callback Controller (Pure Server 302 Redirect - Zero HTML)
const googleAuthCallbackController = async (req, res) => {
  const returnBase = req.query.state
    ? decodeURIComponent(req.query.state)
    : "petmania://google-auth";

  try {
    const { code, error, error_description } = req.query;

    if (error || !code) {
      console.error("[Google OAuth Callback] Error query received:", error, error_description);
      const errMsg = error_description || error || "Authorization code missing";
      const separator = returnBase.includes("#") ? "&" : "#";
      return res.redirect(302, `${returnBase}${separator}error=${encodeURIComponent(errMsg)}`);
    }

    const clientId =
      process.env.GOOGLE_WEB_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      "531711523042-6lbuv5loo95mgqej29slctctlk3i8h3q.apps.googleusercontent.com";
    const clientSecret =
      process.env.GOOGLE_WEB_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET ||
      "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";
    const redirectUri = "https://petmania-backend-delta.vercel.app/api/user/auth/google/callback";

    console.log("[Google OAuth Callback] Exchanging code with client_id:", clientId);

    // 1. Exchange authorization code for Google access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = tokenResponse.data;

    // 2. Fetch User Profile from Google
    const profileResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { sub: googleId, email, name, picture } = profileResponse.data;

    if (!email) {
      const separator = returnBase.includes("#") ? "&" : "#";
      return res.redirect(302, `${returnBase}${separator}error=no_email`);
    }

    // 3. Find or Create User in MongoDB
    let existingUser = await user.findOne({ email });

    if (!existingUser) {
      existingUser = await user.create({
        email,
        googleId,
        name: name || "User",
        avatar: picture,
        isGoogleUser: true,
        isVerified: true,
        isAdharVerified: false,
        userVerified: false,
      });
    } else if (!existingUser.googleId) {
      existingUser.googleId = googleId;
      existingUser.isGoogleUser = true;
      existingUser.isVerified = true;
      if (picture && !existingUser.avatar) existingUser.avatar = picture;
      await existingUser.save();
    }

    // 4. Generate PetMania JWT Token
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userPayload = encodeURIComponent(
      JSON.stringify({
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        avatar: existingUser.avatar,
      })
    );

    // 5. Direct HTTP 302 redirect back into the mobile app (Zero HTML rendered)
    const separator = returnBase.includes("#") ? "&" : "#";
    return res.redirect(302, `${returnBase}${separator}token=${token}&user=${userPayload}`);
  } catch (err) {
    const errorDetails =
      err?.response?.data?.error_description ||
      err?.response?.data?.error ||
      err.message;
    console.error("[Google OAuth Callback Exception]:", errorDetails, err?.response?.data);
    const separator = returnBase.includes("#") ? "&" : "#";
    return res.redirect(302, `${returnBase}${separator}error=${encodeURIComponent(errorDetails)}`);
  }
};

// 🔥 Facebook Login Controller
const userFacebookLoginController = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Access token is required" });
    }

    // Fetch user info from Facebook Graph API
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    const { id: facebookId, email: fbEmail, name, picture } = fbRes.data;
    const avatar = picture?.data?.url;
    const email = fbEmail || `${facebookId}@facebook.com`;

    let existingUser = await user.findOne({
      $or: [{ facebookId }, { email }],
    });

    if (!existingUser) {
      existingUser = await user.create({
        email,
        facebookId,
        name,
        avatar,
        isFacebookUser: true,
        isVerified: true,
        isAdharVerified: false,
        userVerified: false,
      });
    } else if (!existingUser.facebookId) {
      existingUser.facebookId = facebookId;
      existingUser.isFacebookUser = true;
      existingUser.isVerified = true;
      if (avatar && !existingUser.avatar) existingUser.avatar = avatar;
      await existingUser.save();
    }

    const token = jwt.sign(
      { userId: existingUser._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Facebook login successful",
      data: {
        token,
        user: {
          id: existingUser._id,
          email,
          name: existingUser.name,
          avatar: existingUser.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Facebook login error:", error.response?.data || error.message);
    res.status(401).json({ message: "Invalid Facebook access token" });
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

// Register OTP Controller - verify otp sent to user email
const userRegisterOtpController = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : "";
    const existingOtp = await RegisterOtp.findOne({ email: normalizedEmail, otp });

    const existingUser = await user.findOne({ email: normalizedEmail });

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
      await RegisterOtp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        error: { message: "OTP expired" },
      });
    }

    existingUser.isOtpSubmitted = true;
    existingUser.isVerified = true;
    existingUser.otpRequestCount = 0;
    await existingUser.save();

    const token = generateToken({
      userId: existingUser._id,
      email: existingUser.email,
    });

    await RegisterOtp.deleteOne({ email: normalizedEmail });

    return (
      res
        .status(200)
        .json({
          success: true,
          message: "OTP verified successfully",
          data: {
            token: token,
            user: existingUser,
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

// Resend OTP Controller - handles resend for both registration and forgot-password flows
const userResendOtpController = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: "Email is required" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await user.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: "User with this email does not exist" },
      });
    }

    const otp = otpGenerate();

    if (type === "forgot-password") {
      saveOtpToDB(normalizedEmail, otp);

      await emailService.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "OTP for Password Reset",
        html: otpGenerateTemplate(existingUser, otp),
      });
    } else {
      if ((existingUser.otpRequestCount || 0) >= 5) {
        return res.status(429).json({
          success: false,
          error: { message: "Too many attempts. Please try again later." },
        });
      }

      existingUser.otpRequestCount = (existingUser.otpRequestCount || 0) + 1;
      await existingUser.save();

      saveRegisterOtpToDB(normalizedEmail, otp);

      await emailService.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "OTP for Email Verification",
        html: registrationOtpTemplate(existingUser, otp),
      });
    }

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
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
          isAdharVerified: userDetails.isAdharVerified,
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

    // Prevent client from manipulating verification and authentication flags
    delete updatePayload.isVerified;
    delete updatePayload.isAdharVerified;
    delete updatePayload.userVerified;
    delete updatePayload.isOtpSubmitted;
    delete updatePayload.password;
    delete updatePayload.confirmPassword;
    delete updatePayload.googleId;
    delete updatePayload.facebookId;

    // If Aadhaar number or images are being submitted/updated, reset verification status for admin review
    const isAadhaarModified =
      (adharCardFrontImage && adharCardFrontImage !== existingUser.adharCardFrontImage) ||
      (adharCardBackImage && adharCardBackImage !== existingUser.adharCardBackImage) ||
      (updatePayload.adharCardNumber && updatePayload.adharCardNumber !== existingUser.adharCardNumber);

    if (isAadhaarModified) {
      updatePayload.isAdharVerified = false;
      updatePayload.userVerified = false;
    }

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
    const normalizedEmail = email ? email.toLowerCase().trim() : "";
    const existingUser = await user.findOne({ email: normalizedEmail });

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
    const normalizedEmail = email ? email.toLowerCase().trim() : "";
    const existingOtp = await UserOtp.findOne({ email: normalizedEmail, otp });

    if (!existingOtp) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid OTP" },
      });
    }

    if (Date.now() > new Date(existingOtp.expiresAt)) {
      await UserOtp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await UserOtp.deleteOne({ email: normalizedEmail });

    const tempToken = generateToken({ email: normalizedEmail, otpVerified: true }, "10m");

    return (
      res
        .status(200)
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
  userResendOtpController,
  userForgotPasswordController,
  userForgotPasswordotpVerifyController,
  userForgotPasswordControllerMain,
  userResetPasswordController,
  userDetailsController,
  userGoogleLoginController,
  googleAuthCallbackController,
  userFacebookLoginController,
  userUpdateDetailsController,
  userDeleteController,
  toggleFavouriteController,
  getFavouritesController,
};
