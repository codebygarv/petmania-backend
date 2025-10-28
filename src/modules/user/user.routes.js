const express = require("express");
const {
  userLoginValidation,
  userRegisterValidation,
  userForgotValidation,
  userForgotOTPValidation,
  userForgotPasswordMainValidation,
  userRegisterOTPValidation,
} = require("./user.validation");
const {
  userLoginController,
  userRegisterController,
  userForgotPasswordController,
  userForgotPasswordotpVerifyController,
  userForgotPasswordControllerMain,
  userDetailsController,
  userRegisterOtpController,
} = require("./user.controller");
const {
  verifyOtpMiddleware,
  verifyAuthMiddleware,
} = require("./user.middleware");
const router = express.Router();

router.post("/register", userRegisterValidation, userRegisterController);

router.post(
  "/resgister/verifyOtp",
  verifyAuthMiddleware,
  userRegisterOTPValidation,
  userRegisterOtpController
);

router.post("/login", userLoginValidation, userLoginController);

router.get("/details", verifyAuthMiddleware, userDetailsController);

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

module.exports = router;
