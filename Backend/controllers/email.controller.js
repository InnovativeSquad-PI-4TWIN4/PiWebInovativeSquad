require("dotenv").config();
const nodemailer = require("nodemailer");

exports.sendEmailToUser = async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SkillBridge Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    res.status(200).json({ success: true, message: "Email envoyé ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur d’envoi ❌" });
  }
};
