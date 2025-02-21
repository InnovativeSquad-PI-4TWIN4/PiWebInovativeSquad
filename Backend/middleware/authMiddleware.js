// authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_key";

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ status: "FAILED", message: "Access denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Ajout de l'utilisateur décodé à la requête
    next();
  } catch (err) {
    return res.status(400).json({ status: "FAILED", message: "Invalid token." });
  }
};

module.exports = authenticateUser;
