const express = require('express');
const router = express.Router();
const avisController = require('../controllers/AvisController');

// ➤ Route pour ajouter un avis
router.post('/addAvis', avisController.ajouterAvis);

// ➤ Route pour récupérer tous les avis
router.get('/GetAvisList', avisController.getAvis);

// ➤ Route pour supprimer un avis par ID
router.delete('/deleteAvis/:id', avisController.supprimerAvis);

module.exports = router;
