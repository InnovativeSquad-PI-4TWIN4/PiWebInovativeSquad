const express = require("express");
const router = express.Router();
const PubController = require("../controllers/PubController");

router.get("/getAllPub", PubController.getAllPub);
router.get("/getPubById/:id", PubController.getPubById);
router.post("/createPub", PubController.createPub);
router.put("/updatePub/:id", PubController.updatePub);
router.delete("/deletePub/:id", PubController.deletePub);

module.exports = router;