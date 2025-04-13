const express = require("express");
const router = express.Router();
const { 
  sendEmailToUser, 
  sendCertificationEmail,
  sendSuccessCertificateEmail // ✅ nouvelle fonction à ajouter 
} = require("../controllers/email.controller");

// Route existante
router.post("/send", sendEmailToUser);

// ✅ Nouvelle route pour l'email de certification
router.post("/send-certification", sendCertificationEmail);
router.post("/send-success-certificate", sendSuccessCertificateEmail);


module.exports = router;