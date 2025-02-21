const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

router.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleAuthCallback
);

module.exports = router;
