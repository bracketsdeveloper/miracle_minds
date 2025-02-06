const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate users
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized access, token missing or invalid format" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password"); // Exclude sensitive data like password
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access, user not found" });
    }

    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ message: "Unauthorized access, invalid token" });
  }
};

// Middleware to authorize admin users
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
