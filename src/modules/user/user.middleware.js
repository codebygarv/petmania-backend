const jwt = require("jsonwebtoken");

const verifyOtpMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.otpVerified) {
      return res.status(403).json({
        success: false,
        message: "OTP verification required before password reset",
      });
    }

    req.email = decoded.email; // Attach email for next controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyOtpMiddleware;
