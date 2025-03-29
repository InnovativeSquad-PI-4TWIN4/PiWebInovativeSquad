const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_key";

const authenticateUser = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ status: "FAILED", message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Récupère le token après "Bearer"

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
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

// ✅ Exportation correcte des deux middlewares
module.exports = { authenticateUser, isAdmin };

