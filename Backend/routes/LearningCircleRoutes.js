const express = require("express");
const router = express.Router();
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/LearningCircleController");

router.post("/", authenticateUser, controller.createCircle);
router.post("/:id/join", authenticateUser, controller.joinCircle);
router.get("/getALLcircles", controller.getAllCircles); // 🔥 This is the missing one!
router.put("/:id", authenticateUser, controller.updateCircle);
router.delete("/deleteCircle/:id", authenticateUser, controller.deleteCircle);
module.exports = router;
