var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongo = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
const mongoConn = require('./config/DataBase.json');
const session = require('express-session');

const passport = require('passport');
require('./config/passport')(passport);
require("dotenv").config();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', indexRouter);
app.use('/', authRouter);
app.use('/users', usersRouter);
//auth avec google
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_clé_secrète', // Utilisez une clé secrète forte
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettez secure: true en production si vous utilisez HTTPS
}));

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());



// MongoDB connection
mongo.connect(mongoConn.url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB', err);
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
