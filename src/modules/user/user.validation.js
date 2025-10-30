const userLoginValidation = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    next();
  } catch (error) {
    console.error("login validation error:", error);
  }
};

const userRegisterValidation = (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }

    // if (email.includes("+")) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Email address must not contain '+'",
    //   });
    // }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 6 characters long",
      });
    }

    if (confirmPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "confirm password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "passwords do not match",
      });
    }

    next();
  } catch (error) {
    console.error("registration validation error:", error);
  }
};

const userRegisterOTPValidation = (req, res, next) => {
  try {
    if (!req.body.otp) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    next();
  } catch (error) {
    console.error("forgot password validation error:", error);
  }
};

const userForgotValidation = (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    next();
  } catch (error) {
    console.error("forgot password validation error:", error);
  }
};

const userForgotOTPValidation = (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    if (!req.body.otp) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    next();
  } catch (error) {
    console.error("forgot password validation error:", error);
  }
};

const userForgotPasswordMainValidation = (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "please enter required field",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 6 characters long",
      });
    }

    if (confirmPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "confirm password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "passwords do not match",
      });
    }

    next();
  } catch (error) {
    console.error("registration validation error:", error);
  }
};

module.exports = {
  userLoginValidation,
  userRegisterValidation,
  userRegisterOTPValidation,
  userForgotValidation,
  userForgotOTPValidation,
  userForgotPasswordMainValidation,
};
