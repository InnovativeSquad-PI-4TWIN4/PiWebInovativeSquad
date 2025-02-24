// Importations des modules nécessaires
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongo = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

// Importation des routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

// Configuration des variables d'environnement
require("dotenv").config();
require("./config/passport")(passport);
const mongoConn = require("./config/DataBase.json");

// Initialisation de l'application Express
const app = express();

// Configuration du moteur de vue
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Configuration de la session pour Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "votre_clé_secrète",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Connexion à MongoDB
mongo
  .connect(mongoConn.url)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Could not connect to MongoDB:", err));

  //Active CORS pour le frontend React (http://localhost:5173)
app.use(cors({
      origin: 'http://localhost:5173', 
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', '*', 'Access-Control-Allow-Origin']
    }));
// ✅ Déclaration des routes (ORDRE IMPORTANT)
app.use("/", authRouter);
app.use("/index", indexRouter);
app.use("/users", usersRouter);

// ✅ Gestion des erreurs 404 (À PLACER APRÈS LES ROUTES)
app.use((req, res, next) => {
  res.status(404).send("❌ La page que vous avez demandée n'a pas été trouvée !");
});

// ✅ Gestion des autres erreurs
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// Exportation de l'application
module.exports = app;
