const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.googleAuthCallback = async (req, res) => {
  try {
    // Vérification des données utilisateur
    if (!req.user || !req.user._id || !req.user.email) {
      return res.status(400).json({
        status: "FAILED",
        message: "Invalid user data received from Google."
      });
    }

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ status: "FAILED", message: "Invalid credentials." });
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.SESSION_SECRET || "default_secret_key",
      { expiresIn: "1d" }
    );

    // Redirection vers le frontend avec le token
    res.redirect(`http://localhost:5173/?token=${token}`);
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};