const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "school_attendance_super_secret_2026";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. Login required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);

    req.user = user;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token.",
    });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission.",
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};