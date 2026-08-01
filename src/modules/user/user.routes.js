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
  userGoogleLoginController,
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

router.post("/login", userLoginValidation, userLoginController);
router.post("/google", userGoogleLoginController);
router.post("/facebook", userFacebookLoginController);

// Google OAuth Relay Callback Endpoint
router.get("/auth/google/callback", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Authentication - PetMania</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #121212; color: #fff; text-align: center; }
          .card { padding: 30px; border-radius: 16px; background: #1e1e1e; box-shadow: 0 4px 20px rgba(0,0,0,0.5); max-width: 90%; }
          .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #f97316; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { margin: 0 0 10px; font-size: 20px; }
          p { color: #888; font-size: 14px; margin: 0; }
          .btn { display: inline-block; margin-top: 20px; background: #f97316; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h2>Completing Sign In...</h2>
          <p>Redirecting back to PetMania app.</p>
          <a id="returnBtn" href="#" class="btn" style="display:none;">Tap to Return to App</a>
        </div>
        <script>
          (function() {
            try {
              const rawHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
              const params = new URLSearchParams(rawHash || window.location.search);
              const state = params.get('state');
              
              let returnBase = "petmania://google-auth";
              if (state) {
                returnBase = decodeURIComponent(state);
              }
              
              const separator = returnBase.includes('#') ? '&' : '#';
              const fullRedirect = returnBase + (rawHash ? separator + rawHash : '');
              
              const btn = document.getElementById('returnBtn');
              if (btn) {
                btn.href = fullRedirect;
                btn.style.display = 'inline-block';
              }
              
              // Attempt automatic redirection
              setTimeout(function() {
                window.location.href = fullRedirect;
              }, 100);
            } catch(e) {
              console.error(e);
            }
          })();
        </script>
      </body>
    </html>
  `);
});

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
