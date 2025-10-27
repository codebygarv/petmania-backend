const express = require("express");
const { userLoginValidation, userRegisterValidation, userForgotValidation, userForgotOTPValidation, userForgotPasswordMainValidation } = require("./user.validation");
const { userLoginController, userRegisterController, userForgotPasswordController, otpVerifyController, userForgotPasswordControllerMain, userDetailsController } = require("./user.controller");
const { verifyOtpMiddleware, verifyAuthMiddleware } = require("./user.middleware");
const router = express.Router();

router.post('/register', userRegisterValidation,userRegisterController);
router.post("/login", userLoginValidation, userLoginController);
router.get("/details",verifyAuthMiddleware , userDetailsController);
router.post('/forgotPassword',userForgotValidation,userForgotPasswordController);
router.post('/forgotPassword/otpVerify', userForgotOTPValidation , otpVerifyController);
router.post('/forgotPassword/changePassword',verifyOtpMiddleware, userForgotPasswordMainValidation , userForgotPasswordControllerMain);

module.exports = router;