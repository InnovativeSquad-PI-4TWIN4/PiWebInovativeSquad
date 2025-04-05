const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, scope:["email", "profile"] }),
  authController.googleAuthCallback
);
// Lancer l'authentification Facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Callback après l'authentification Facebook
// Callback après l'authentification Facebook
// Callback après authentification Facebook
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "http://localhost:5173/profile", // Actuellement : mauvaise redirection
    failureRedirect: "/auth/failure",
  })
);

// Routes de succès et d'échec
router.get("/success", (req, res) => {
  res.send("✅ Connexion réussie !");
});

router.get("/failure", (req, res) => {
  res.send("❌ Échec de la connexion !");
});

// Récupérer l'utilisateur actuellement connecté
router.get("/current_user", (req, res) => {
  if (req.isAuthenticated()) {
      res.json(req.user);
  } else {
      res.status(401).json({ error: "Utilisateur non authentifié" });
  }
});



module.exports = router;
