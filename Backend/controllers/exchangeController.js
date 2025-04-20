const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User"); 
// Create exchange request
exports.createExchangeRequest = async (req, res) => {
  try {
    console.log("📥 exchange request body:", req.body);
    console.log("👤 req.user:", req.user);

    const { receiverId, skillOffered, skillRequested } = req.body;

    if (!receiverId || !skillOffered || !skillRequested) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newRequest = new ExchangeRequest({
      senderId: req.user.userId, 
      receiverId,
      skillOffered,
      skillRequested,
      status: 'pending',
      createdAt: new Date()
    });
    

    await newRequest.save();
    res.status(201).json({ message: 'Exchange request sent successfully!' });
  } catch (error) {
    console.error("❌ Error creating exchange request:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all requests for current user (incoming or sent)
exports.getMyExchangeRequests = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Correction ici

    const requests = await ExchangeRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "name surname email")
      .populate("receiverId", "name surname email");

    res.status(200).json(requests);
  } catch (error) {
    console.error("❌ Error fetching exchange requests:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Accept or reject request
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const request = await ExchangeRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ message: "Server error." });
  }
};
