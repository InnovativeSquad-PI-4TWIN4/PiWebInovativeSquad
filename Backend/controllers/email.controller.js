require("dotenv").config();
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");


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
exports.sendCertificationEmail = async (req, res) => {
  const { to, name, examLink } = req.body;

  try {
    const templatePath = path.join(__dirname, "../templates/certificationInvitation.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");

    // Remplacer les variables dynamiques
    htmlContent = htmlContent
      .replace("{{name}}", name)
      .replace("{{examLink}}", examLink);

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
      subject: "📩 Invitation à passer l’examen de certification",
      html: htmlContent,
    });

    res.status(200).json({ success: true, message: "Email de certification envoyé ✅" });
  } catch (error) {
    console.error("Erreur email:", error);
    res.status(500).json({ success: false, error: "Erreur lors de l’envoi de l’email" });
  }
};
