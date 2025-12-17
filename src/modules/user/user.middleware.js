const jwt = require("jsonwebtoken");

const verifyOtpMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authorization token missing",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: "You are not authorized",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.otpVerified) {
      return res.status(403).json({
        success: false,
        error: {
          message: "OTP verification required before password reset",
        },
      });
    }

    req.email = decoded.email; // Attach email for next controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Invalid or expired token",
      },
    });
  }
};

const verifyAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authorization token missing",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "You are not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.email) {
      return res.status(403).json({
        success: false,
        error: {
          message: "You are not authorized",
        },
      });
    }

    req.email = decoded.email; // Attach email for next controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Invalid or expired token",
      },
    });
  }
};

module.exports = {
  verifyOtpMiddleware,
  verifyAuthMiddleware,
};
