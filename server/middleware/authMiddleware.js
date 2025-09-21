// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");

function authMiddleware(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      // verify JWT
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // role check
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Access denied: role not allowed" });
      }

      // attach user from DB
      const user = await Seller.findById(payload.id).select("-password");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = { id: user._id, role: payload.role, ...user._doc };

      next();
    } catch (err) {
      console.error("auth error", err.message);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;
