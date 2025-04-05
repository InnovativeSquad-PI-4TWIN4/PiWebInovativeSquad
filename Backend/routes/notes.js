const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Create a new note
router.post("/", authenticateUser, noteController.createNote);

// Get all notes for a user
router.get("/", authenticateUser, noteController.getUserNotes);

// Get a single note
router.get("/:id", authenticateUser, noteController.getNote);

// Update a note
router.put("/:id", authenticateUser, noteController.updateNote);

// Delete a note
router.delete("/:id", authenticateUser, noteController.deleteNote);

module.exports = router;