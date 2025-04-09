const express = require("express");
const router = express.Router();
const { sendEmailToUser } = require("../controllers/email.controller");

router.post("/send", sendEmailToUser);

module.exports = router;
