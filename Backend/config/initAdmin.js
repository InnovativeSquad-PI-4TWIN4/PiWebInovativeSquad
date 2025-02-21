require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Importation de jsonwebtoken
const User = require("../models/User");
const dbConfig = require("../config/DataBase.json"); // Importe le fichier JSON

const mongoURI = dbConfig.url; // Récupère l'URL de la base de données

if (!mongoURI) {
  console.error("❌ Erreur : L'URL de connexion MongoDB est introuvable !");
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connecté à MongoDB");

    // Vérifier si l'admin existe déjà
    const adminEmail = "admin@example.com";
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log("ℹ️ Un administrateur existe déjà !");
    } else {
      // Création de l'admin avec un mot de passe hashé
      const hashedPassword = await bcrypt.hash("adminpassword", 10);
      admin = new User({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("✅ Administrateur créé avec succès !");
    }

    // Créer un token JWT pour l'admin
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("✅ Token JWT de l'admin généré : ", token);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
