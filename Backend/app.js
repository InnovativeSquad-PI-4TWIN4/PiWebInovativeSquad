const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const premiumRouter = require("./routes/premiumCourses");
const coursesRouter = require("./routes/courses");
const avisRouter = require("./routes/Avis");
const packRoutes = require("./routes/pack");
const publicationRouter = require("./routes/publication");
const messageRouter = require("./routes/message");

require("dotenv").config();
require("./config/passport");
const mongoConn = require("./config/DataBase.json");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Servir les fichiers statiques
app.use('/public', express.static(path.join(__dirname, 'public'))); // Ajout pour /public/images
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Garder pour /uploads

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(mongoConn.url, {
   // useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Could not connect to MongoDB:", err));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/index", indexRouter);
app.use("/users", usersRouter);
app.use("/courses", coursesRouter);
app.use("/premium", premiumRouter);
app.use("/avis", avisRouter);
app.use("/packs", packRoutes);
app.use("/publication", publicationRouter);
app.use("/messages", messageRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "❌ La page demandée n'a pas été trouvée !" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Erreur interne du serveur";
  res.status(status).json({
    error: req.app.get("env") === "development" ? message : "Une erreur est survenue",
    ...(req.app.get("env") === "development" && { stack: err.stack }),
  });
});

module.exports = app;