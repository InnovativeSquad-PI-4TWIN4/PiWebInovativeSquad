const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateUser } = require("../middleware/authMiddleware");
const multer = require('multer');
// Configuration de Multer pour stocker les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Assurez-vous que ce dossier existe
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage });

// Créer ou récupérer une salle de chat
router.post('/create', authenticateUser, chatController.createChat);

// Envoyer un message
router.post('/send/:publicationId', authenticateUser, chatController.sendMessage);
router.get('/getMessages/:publicationId', authenticateUser, chatController.getMessages);
router.post('/upload', authenticateUser, upload.single('file'), chatController.uploadFile);

module.exports = router;