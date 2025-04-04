const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_key";

const authenticateUser = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Erreur: Aucun token fourni ou format incorrect");
    return res.status(401).json({ status: "FAILED", message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Erreur: Token manquant après 'Bearer'");
    return res.status(401).json({ status: "FAILED", message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token décodé:", decoded); // Log pour déboguer
    req.user = decoded; // decoded contient { userId, email, role }
    next();
  } catch (err) {
    console.error("Erreur lors de la vérification du token:", err.message);
    return res.status(400).json({ status: "FAILED", message: "Invalid token." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé, vous n'êtes pas administrateur." });
  }
};

module.exports = { authenticateUser, isAdmin };