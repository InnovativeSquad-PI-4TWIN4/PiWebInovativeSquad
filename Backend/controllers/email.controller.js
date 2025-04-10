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
  const { to, name, categoryCount } = req.body;

  const examLinksByCategory = {
    "Programmation": "https://skillbridge.tn/examen/programmation",
    "Design": "https://skillbridge.tn/examen/design",
    "Marketing": "https://skillbridge.tn/examen/marketing",
    "Réseau": "https://skillbridge.tn/examen/reseau",
    "Développement Web": "https://skillbridge.tn/examen/devweb",
    "Développement Mobile": "https://skillbridge.tn/examen/mobile",
    "Mathématique": "https://skillbridge.tn/examen/math",
  };

  try {
    const topCategory = Object.entries(categoryCount || {})
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topCategory || !examLinksByCategory[topCategory]) {
      return res.status(400).json({ success: false, error: "Catégorie non valide ou manquante" });
    }

    const examLink = examLinksByCategory[topCategory];

    // 🛠️ Construction HTML dynamique avant les remplacements
    const categoryListHTML = Object.entries(categoryCount || {})
      .map(([cat, count]) => `<li><strong>${cat}</strong> : ${count} quiz</li>`)
      .join("");

    const templatePath = path.join(__dirname, "../templates/certificationInvitation.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");

    htmlContent = htmlContent
      .replace("{{name}}", name)
      .replace("{{examLink}}", examLink)
      .replace("{{categoryList}}", categoryListHTML);

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
