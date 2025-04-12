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

  // ✅ Utilisation de CLIENT_URL pour rendre les liens dynamiques
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const examLinksByCategory = {
    "Programmation": `${clientUrl}/examen/programmation`,
    "Design": `${clientUrl}/examen/design`,
    "Marketing": `${clientUrl}/examen/marketing`,
    "Réseau": `${clientUrl}/examen/reseau`,
    "Développement Web": `${clientUrl}/examen/devweb`,
    "Développement Mobile": `${clientUrl}/examen/mobile`,
    "Mathématique": `${clientUrl}/examen/math`,
  };

  try {
    const topCategory = Object.entries(categoryCount || {})
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topCategory || !examLinksByCategory[topCategory]) {
      return res.status(400).json({ success: false, error: "Catégorie non valide ou manquante" });
    }

    const examLink = examLinksByCategory[topCategory];

    // ✅ HTML dynamique avec la liste des catégories validées
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
exports.sendSuccessCertificateEmail = async (req, res) => {
  const { to, name, category, score } = req.body;

  try {
    const PDFDocument = require("pdfkit");
    const os = require("os");

    const doc = new PDFDocument();
    const filePath = path.join(os.tmpdir(), `${name}-certificat.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(22).text("🎓 CERTIFICAT DE RÉUSSITE", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Félicitations ${name} !`);
    doc.text(`Catégorie : ${category}`);
    doc.text(`Score : ${score}/5`);
    doc.text(`Date : ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text("L'équipe SkillBridge", { align: "right" });
    doc.end();

    stream.on("finish", async () => {
      const templatePath = path.join(__dirname, "../templates/certificationSuccess.html");
      let htmlContent = fs.readFileSync(templatePath, "utf8");

      htmlContent = htmlContent
        .replace("{{name}}", name)
        .replace("{{category}}", category)
        .replace("{{score}}", score);

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
        subject: "🎉 Votre certificat de réussite SkillBridge",
        html: htmlContent,
        attachments: [
          {
            filename: `${category}-certificat.pdf`,
            path: filePath,
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ success: true, message: "Certificat envoyé avec succès 🎉" });
    });
  } catch (error) {
    console.error("Erreur email:", error);
    res.status(500).json({ success: false, error: "Erreur lors de l’envoi du certificat" });
  }
};
