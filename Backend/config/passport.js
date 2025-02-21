// config/passport.js
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const UserModel = require("../models/User");
require("dotenv").config();

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          let user = await UserModel.findOne({ googleId: profile.id });
          if (!user) {
            // Vérifier si un compte avec cet email existe déjà
            user = await UserModel.findOne({ email: profile.emails[0].value });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = new UserModel({
                googleId: profile.id,
                name: profile.given_name || "Unknown",
                surname: profile.family_name || "Unknown",
                email: profile.emails[0].value,
                secret: accessToken
              });
              await user.save();
            }
          }
          return cb(null, user);
        } catch (err) {
          console.error("Erreur lors de l'authentification Google :", err);
          return cb(err);
        }
      }
    )
  );
};
