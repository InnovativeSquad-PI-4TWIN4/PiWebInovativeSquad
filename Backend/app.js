// app.js
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongo = require("mongoose");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
const mongoConn = require("./config/DataBase.json");
const session = require("express-session");

const passport = require("passport");
require("dotenv").config();
require("./config/passport")(passport);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session pour Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "votre_clé_secrète",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/index", indexRouter);
app.use("/", authRouter);
app.use("/users", usersRouter);

// Connexion à MongoDB
mongo
  .connect(mongoConn.url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// 404 error handler with more specific message
app.use(function(req, res, next) {
  res.status(404).send("La page que vous avez demandée n'a pas été trouvée !");
});

module.exports = app;
