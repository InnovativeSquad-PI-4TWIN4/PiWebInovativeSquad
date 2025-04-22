const express = require("express");
const router = express.Router();
const { createAppointment, getUserAppointments ,updateAppointmentStatus} = require("../controllers/appointmentController");

router.post("/create", createAppointment);
router.get("/user/:userId", getUserAppointments);
router.patch("/update-status/:appointmentId", updateAppointmentStatus);


module.exports = router;
