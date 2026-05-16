const jwt = require("jsonwebtoken");

const verifyAdminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Authorization token missing" },
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: "You are not authorized" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.adminId || (decoded.role !== "admin" && decoded.role !== "superadmin")) {
      return res.status(403).json({
        success: false,
        error: { message: "Admin access required" },
      });
    }

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  }
};

module.exports = { verifyAdminMiddleware };