const Note = require("../models/Note");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title = "Untitled Note", content = "", category = "Personal", tags = [] } = req.body;
    
    const note = new Note({
      title,
      content,
      category,
      tags,
      user: req.user.userId
    });

    const savedNote = await note.save();
    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: savedNote  // Changed from 'note' to 'data' for consistency
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to create note" 
    });
  }
};

// Get all notes for a user
exports.getUserNotes = async (req, res) => {
    try {
      const notes = await Note.find({ user: req.user.userId })
        .sort({ updatedAt: -1 });
  
      if (!notes || notes.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No notes found",
          count: 0,
          data: []
        });
      }
  
      return res.status(200).json({
        success: true,
        count: notes.length,
        data: notes
      });
    } catch (error) {
      console.error("Error fetching notes:", error);
      return res.status(500).json({ 
        success: false,
        message: "Server error while fetching notes" 
      });
    }
  };

// Get a single note by ID
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch note"
    });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        title,
        content,
        category,
        tags,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: "Note not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note // Changed from 'note' to 'data' for consistency
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to update note" 
    });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: "Note not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to delete note" 
    });
  }
};