const express = require("express");
const router = express.Router();
const { createAppointment, getUserAppointments } = require("../controllers/appointmentController");

router.post("/create", createAppointment);
router.get("/user/:userId", getUserAppointments);

module.exports = router;
