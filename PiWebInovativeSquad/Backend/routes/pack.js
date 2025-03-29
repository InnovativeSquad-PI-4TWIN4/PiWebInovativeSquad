const express = require("express");
const router = express.Router();
const PackController = require("../controllers/PackController");

router.get("/getAllPacks", PackController.getAllPacks);
router.get("/getPackById/:id", PackController.getPackById);
router.post("/createPack", PackController.createPack);
router.put("/updatePack/:id", PackController.updatePack);
router.delete("/deletePack/:id", PackController.deletePack);

module.exports = router;
