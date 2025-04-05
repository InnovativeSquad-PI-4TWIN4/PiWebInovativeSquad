const express = require("express");
const router = express.Router();

const {
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require("../controllers/FavoriteController");

// ➕ Ajouter aux favoris
router.post("/add", addToFavorites);

// ➖ Retirer des favoris
router.post("/remove", removeFromFavorites);

// 📥 Récupérer la liste des favoris d'un utilisateur
router.get("/:userId", getFavorites);

module.exports = router;
