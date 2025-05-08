const nodemailer = require("nodemailer");
require("dotenv").config(); // Pour charger les variables depuis .env

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;