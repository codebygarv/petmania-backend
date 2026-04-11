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
  userGoogleLoginController,
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
  "/resgister/verifyOtp",
  userRegisterOTPValidation,
  userRegisterOtpController
);

// router.post("/login",  verifyOtpMiddleware, userLoginValidation, userLoginController);  // need to check this
router.post("/login", userLoginValidation, userLoginController);
router.post("/google", userGoogleLoginController);

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

module.exports = router;
