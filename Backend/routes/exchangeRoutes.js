const express = require("express");
const router = express.Router();
const exchangeController = require("../controllers/exchangeController");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");

// Send new skill exchange request
router.post("/", authenticateUser, exchangeController.createExchangeRequest);

// Get all requests where user is sender or receiver
router.get("/my-requests", authenticateUser, exchangeController.getMyExchangeRequests);

// Accept or reject a request
router.put("/:requestId",authenticateUser,  exchangeController.respondToRequest);
router.post('/:roomId/validate', authenticateUser,exchangeController.validateExchange);
router.post('/fix-code',exchangeController.fixCode);

module.exports = router;
