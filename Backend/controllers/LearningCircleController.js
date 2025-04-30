const LearningCircle = require("../models/LearningCircle");
const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Make sure this line is included

dotenv.config();
// Create a new circle
exports.createCircle = async (req, res) => {
  try {
    const { topic, description, skillTag, level, scheduledDate, maxParticipants } = req.body;
    
    // Check for required fields
    if (!topic || !description || !skillTag || !level || !scheduledDate || !maxParticipants) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    console.log("Received data:", req.body); // For debugging
    const roomId = crypto.randomBytes(4).toString('hex'); // Generate a unique room ID

    // Create a new circle
    const circle = new LearningCircle({
      topic,
      description,
      skillTag,
      level,
      scheduledDate,
      maxParticipants,
      moderator: req.user.userId, // Corrected to use req.user.userId
      videoCallLink: `http://localhost:5173/video-call/${roomId}`, // Store video call link

    });

    // Save the circle
    await circle.save();

    // After creating the circle, populate moderator and participants fields
    const updatedCircle = await LearningCircle.findById(circle._id)
      .populate("moderator", "name email")  // Populating the moderator
      .populate("participants", "name");   // Optional: Populate participants if needed

    res.status(201).json(updatedCircle);
  } catch (err) {
    console.error("Error creating circle:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCircles = async (req, res) => {
  try {
    const circles = await LearningCircle.find()
      .populate("moderator", "name surname") // so frontend can access moderator name
      .populate("participants", "name surname"); // optional
    res.json(circles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join a circle
exports.joinCircle = async (req, res) => {
  try {
    console.log("🔍 Request received to join circle");
    console.log("➡️ req.user:", req.user);

    const circle = await LearningCircle.findById(req.params.id);
    if (!circle) {
      console.log("❌ Circle not found");
      return res.status(404).json({ message: "Circle not found" });
    }

    const alreadyJoined = circle.participants.some(participant =>
      String(participant) === String(req.user.userId) // 👈 Corrected field
    );

    if (alreadyJoined) {
      console.log("⚠️ User already joined");
      return res.status(400).json({ message: "You have already joined this circle." });
    }

    if (circle.participants.length >= circle.maxParticipants) {
      console.log("⚠️ Circle full");
      return res.status(400).json({ message: "Circle is full." });
    }

    circle.participants.push(req.user.userId);
    await circle.save();

    const updatedCircle = await LearningCircle.findById(circle._id)
      .populate("participants", "name surname");

    console.log("✅ User added successfully");
    res.json(updatedCircle);

  } catch (err) {
    console.error("🔥 Join circle error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.updateCircle = async (req, res) => {
  try {
    const circle = await LearningCircle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: "Circle not found" });

    // 🔐 Authorization check
    if (String(circle.moderator) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Forbidden: Not the moderator of this circle" });
    }

    Object.assign(circle, req.body); // ✅ apply updates
    await circle.save();
    res.json(circle);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteCircle = async (req, res) => {
  try {
    const circle = await LearningCircle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: "Circle not found" });

    // Check if the logged-in user is the moderator
    if (String(circle.moderator) !== String(req.user.userId)) {
      return res.status(403).json({ message: "You are not authorized to delete this circle." });
    }

    // Add the reason for deletion if provided
    if (req.body.deleteReason) {
      circle.deleteReason = req.body.deleteReason;
    }

    await circle.deleteOne();
    res.json({ message: "Circle deleted successfully", reason: circle.deleteReason });
  } catch (err) {
    console.error("Error deleting circle:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Replace with your OAuth token if using OAuth, or use your JWT token.
const ZOOM_JWT_TOKEN = process.env.ZOOM_JWT_TOKEN;

const createZoomMeeting = async (req, res) => {
  const { topic, description, startTime, duration } = req.body;

  try {
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic,
      type: 2,  // 2 means scheduled meeting
      start_time: startTime, // Start time in UTC format (ISO 8601)
      duration, // Duration in minutes
      timezone: 'America/New_York', // Replace with your timezone
      agenda: description, // Meeting description
      settings: {
        host_video: true,
        participant_video: true,
        mute_upon_entry: true,
        join_before_host: true,
      },
    }, {
      headers: {
        Authorization: `Bearer ${ZOOM_JWT_TOKEN}`,
      },
    });

    // Respond with the meeting link or meeting ID
    res.status(201).json({
      join_url: response.data.join_url, // Link for joining the meeting
      meeting_id: response.data.id,
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    res.status(500).json({ message: 'Error creating Zoom meeting' });
  }
};
