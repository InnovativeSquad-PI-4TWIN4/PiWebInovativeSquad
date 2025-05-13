const MatchRequest = require("../models/MatchRequest");
const MatchRoom = require("../models/MatchRoom");
const fetch = require('node-fetch');
const axios = require("axios");


exports.sendMatchRequest = async (req, res) => {
  try {
    const { sender, receiver, publication } = req.body;

    if (!sender || !receiver || !publication) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const newRequest = new MatchRequest({
      sender,
      receiver,
      publication,
      status: "pending",
      createdAt: new Date(),
    });

    await newRequest.save();
    res.status(201).json({ message: "Demande de match envoyée", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching matches for userId:", userId);

    const sent = await MatchRequest.find({ sender: userId })
  .populate("receiver", "name surname")
  .populate("publication", "description")
// 🔥 Supprime `.select(...)` car il coupe potentiellement `roomId` si mal géré
// OU bien garde-le avec le bon nom :
  .select("_id status roomId receiver publication");

const received = await MatchRequest.find({ receiver: userId })
  .populate("sender", "name surname")
  .populate("publication", "description")
  .select("_id status roomId sender publication");

    res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Error in getUserMatches:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.acceptMatch = async (req, res) => {
  try {
    const match = await MatchRequest.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match non trouvé" });

    const { data: roomData } = await axios.post(
      "http://localhost:3000/api/match-rooms/create",
      { user1Id: match.sender, user2Id: match.receiver },
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    
    const roomId = roomData.roomId;
    
    match.status = "accepted";
    match.roomId = roomId;
    await match.save();
    

    const io = req.app.get("socketio");
    const onlineUsers = req.app.get("onlineUsers");

    const senderSocketId = onlineUsers.get(match.sender.toString());
    const receiverSocketId = onlineUsers.get(match.receiver.toString());

    const updatedMatch = { matchId: match._id, status: "accepted", roomId };

    if (senderSocketId) {
      io.to(senderSocketId).emit("match-updated", updatedMatch);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("match-updated", updatedMatch);
    }

    res.status(200).json({
      message: "Match accepté",
      roomId,
      match: {
        _id: match._id,
        sender: match.sender,
        receiver: match.receiver,
        publication: match.publication,
        status: match.status,
        roomId: match.roomId,
      },
    });
  } catch (err) {
    console.error("❌ Error accepting match:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.rejectMatch = async (req, res) => {
  try {
    const match = await MatchRequest.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match non trouvé" });

    match.status = "rejected";
    await match.save();

    // Émettre un événement Socket.IO pour notifier les deux utilisateurs
    const io = req.app.get("socketio");
    io.emit("match-updated", {
      matchId: match._id,
      status: "rejected",
      senderId: match.sender.toString(),
      receiverId: match.receiver.toString(),
    });

    res.status(200).json({ message: "Match rejeté", match });
  } catch (err) {
    console.error("❌ Error rejecting match:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};