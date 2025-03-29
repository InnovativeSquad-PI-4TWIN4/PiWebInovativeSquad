const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const UserModel = require("../models/User");
require("dotenv").config();

// ✅ Sérialisation et désérialisation de l'utilisateur
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

// ✅ Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, _refreshToken, profile, cb) => {
      try {
        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
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
              secret: accessToken,
            });
            await user.save();
          }
        }
        return cb(null, user);
      } catch (err) {
        console.error("❌ Erreur lors de l'authentification Google :", err);
        return cb(err);
      }
    }
  )
);

// ✅ Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({ facebookId: profile.id });

        if (!user) {
          user = await UserModel.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            user.facebookId = profile.id;
            await user.save();
          } else {
            user = new UserModel({
              facebookId: profile.id,
              name: profile.displayName || "Unknown",
              email: profile.emails?.[0]?.value || "",
              secret: accessToken,
            });
            await user.save();
          }
        }
        return done(null, user);
      } catch (err) {
        console.error("❌ Erreur lors de l'authentification Facebook :", err);
        return done(err);
      }
    }
  )
);

// ✅ Exporter passport après configuration
module.exports = passport;
