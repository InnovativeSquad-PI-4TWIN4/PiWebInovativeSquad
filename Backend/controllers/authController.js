const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.googleAuthCallback = (req, res) => {
  if (!req.user || !req.user._id || !req.user.email) {
    return res.status(400).json({ status: "FAILED", message: "Invalid user data received from Google." });
  }

  const token = jwt.sign(
    {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    process.env.SESSION_SECRET || "default_secret_key",
    { expiresIn: "1d" }
  );

  return res.status(200).json({
    status: "SUCCESS",
    token
  });
};
