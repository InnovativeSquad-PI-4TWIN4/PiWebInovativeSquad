var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/auth/google',
    passport.authenticate('google', { scope:
        [ 'email', 'profile' ] }
  ));
  
  const jwt = require('jsonwebtoken');

  router.get('/auth/google/callback',
    (req, res, next) => {
      passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de l\'authentification Google.' });
        }
        if (!user) {
          return res.status(401).json({ message: 'Authentification Google échouée.' });
        }
        req.user = user;
        next();
      })(req, res, next);
    },
    (req, res) => {
      if (!req.user || !req.user._id || !req.user.email ) {
        return res.status(400).json({ message: 'Données utilisateur manquantes ou invalides.' });
      }
      const token = jwt.sign(
        {
          userId: req.user._id, 
          name: req.user.name, 
          email: req.user.email
          
        },
        process.env.SECRET_KEY,
        { expiresIn: '1d' }
      );
      res.status(200).json({ token });
    }
  );
  module.exports = router;