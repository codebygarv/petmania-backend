const express = require("express");
const {
  userLoginValidation,
  userRegisterValidation,
  userForgotValidation,
  userForgotOTPValidation,
  userForgotPasswordMainValidation,
  userRegisterOTPValidation,
  userResetPasswordValidation,
} = require("./user.validation");
const {
  userLoginController,
  userRegisterController,
  userForgotPasswordController,
  userForgotPasswordotpVerifyController,
  userForgotPasswordControllerMain,
  userResetPasswordController,
  userDetailsController,
  userRegisterOtpController,
  userResendOtpController,
  userGoogleLoginController,
  googleAuthCallbackController,
  userFacebookLoginController,
  userUpdateDetailsController,
  userDeleteController,
  toggleFavouriteController,
  getFavouritesController,
} = require("./user.controller");
const {
  verifyOtpMiddleware,
  verifyAuthMiddleware,
} = require("./user.middleware");
const router = express.Router();

router.post("/register", userRegisterValidation, userRegisterController);

router.post(
  "/register/verifyOtp",
  userRegisterOTPValidation,
  userRegisterOtpController
);

router.post("/resend-otp", userResendOtpController);

router.post("/login", userLoginValidation, userLoginController);
router.post("/google", userGoogleLoginController);
router.post("/facebook", userFacebookLoginController);

// Google OAuth Relay Callback Endpoint
router.get("/auth/google/callback", googleAuthCallbackController);

router.get("/details", verifyAuthMiddleware, userDetailsController);
router.put("/updateDetails", verifyAuthMiddleware , userUpdateDetailsController);
router.delete("/delete", verifyAuthMiddleware, userDeleteController);

router.post("/favourites/toggle", verifyAuthMiddleware, toggleFavouriteController);
router.get("/favourites", verifyAuthMiddleware, getFavouritesController);

router.post(
  "/forgotPassword",
  userForgotValidation,
  userForgotPasswordController
);

router.post(
  "/forgotPassword/otpVerify",
  userForgotOTPValidation,
  userForgotPasswordotpVerifyController
);

router.post(
  "/forgotPassword/changePassword",
  verifyOtpMiddleware,
  userForgotPasswordMainValidation,
  userForgotPasswordControllerMain
);

router.post(
  "/resetPassword",
  verifyAuthMiddleware,
  userResetPasswordValidation,
  userResetPasswordController
);

module.exports = router;
