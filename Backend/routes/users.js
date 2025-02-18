const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const UserVerification = require('./../models/UserVerification');
//password handler
const bcrypt = require('bcrypt');
//Email handler
//const nodemailer = require('nodemailer');

//unique string
//const {v4 : uuidv4}=require ("uuid");
const jwt = require('jsonwebtoken');
//env variable
require("dotenv").config();
// Clé secrète pour signer les tokens JWT (change-la et garde-la secrète)
const JWT_SECRET = 'votre_cle_secrete';

/* GET users listing. */
router.get('/', (req, res) => {
    res.send('respond with a resource');
});

// console.log("EMAIL:", process.env.AUTH_EMAIL);
// console.log("PASSWORD:", process.env.AUTH_PASS ? "Loaded" : "Not Loaded");


//nodemailer stuff
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth:{
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   }
// })

//testing success
// transporter.verify((error,success)=>
// {
//   if (error){
//     console.log(error);
//   }else {
//     console.log("Ready to messages");
//     console.log(success);
//   }
// })


// SignUp Route
router.post('/signup', async (req, res) => {
    try {
        let { name, surname, email, password, dateOfBirth, Skill } = req.body;

        // Vérification si les champs sont vides
        if (!name || !surname || !email || !password || !dateOfBirth || !Skill) {
            return res.json({ status: "FAILED", message: "Empty input fields!" });
        }

        // Suppression des espaces inutiles
        name = name.trim();
        surname = surname.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();
        Skill = Skill.trim();

        // Vérification des formats
        if (!/^[a-zA-Z ]*$/.test(name)) {
            return res.json({ status: "FAILED", message: "Invalid name entered" });
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.json({ status: "FAILED", message: "Invalid email entered" });
        }

        // Vérification de la date de naissance (conversion en Date)
        const date = new Date(dateOfBirth);
        if (isNaN(date.getTime())) {
            return res.json({ status: "FAILED", message: "Invalid date of birth entered. Use YYYY-MM-DD format." });
        }

        // Vérification de la longueur du mot de passe
        if (password.length < 8) {
            return res.json({ status: "FAILED", message: "Password is too short! It must be at least 8 characters." });
        }

        console.log("Checking if user already exists...");
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ status: "FAILED", message: "User with the provided email already exists!" });
        }

        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating new user...");
        const newUser = new User({
            name,
            surname,
            email,
            password: hashedPassword,
            dateOfBirth: date, // Utilisation de l'objet Date correctement converti
            Skill
        });

        console.log("Saving user to database...");
        const savedUser = await newUser.save();

        console.log("Sign-up successful!");
        return res.json({
            status: "SUCCESS",
            message: "Sign-up successful!",
            data: savedUser
        });

    } catch (err) {
        console.error("Sign-up error:", err);
        return res.json({
            status: "FAILED",
            message: err.message || "An error occurred during sign-up!"
        });
    }
});

// SignIn Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Vérification des champs vides
  if (!email || !password) {
    return res.json({
      status: "FAILED",
      message: "Empty email or password fields!"
    });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: "FAILED",
        message: "Invalid credentials! User not found."
      });
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.json({
        status: "FAILED",
        message: "Invalid credentials! Wrong password."
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Expiration du token en 1 heure
    );

    return res.json({
      status: "SUCCESS",
      message: "Sign-in successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        Skill: user.Skill
      }
    });

  } catch (err) {
    console.error(err);
    return res.json({
      status: "FAILED",
      message: "An error occurred during sign-in!"
    });
  }
});
module.exports = router;
