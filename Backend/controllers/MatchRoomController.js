const MatchRoom = require("../models/MatchRoom");
const crypto = require("crypto");

exports.createMatchRoom = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      return res.status(400).json({ message: "Les deux IDs d'utilisateurs sont requis." });
    }

    // Vérifier qu'il n'existe pas déjà une room pour ces deux utilisateurs
    const existingRoom = await MatchRoom.findOne({
      participants: { $all: [user1Id, user2Id] },
    });

    if (existingRoom) {
      return res.status(200).json({ roomId: existingRoom.roomId, _id: existingRoom._id });
    }

    // Générer un ID unique pour la room
    const roomId = crypto.randomBytes(4).toString("hex");

    // Créer une nouvelle room
    const matchRoom = new MatchRoom({
      participants: [user1Id, user2Id],
      roomId,
    });

    await matchRoom.save();

    // Remplir les informations des participants
    const populatedRoom = await MatchRoom.findById(matchRoom._id).populate(
      "participants",
      "name email"
    );

    res.status(201).json({ roomId: populatedRoom.roomId, _id: populatedRoom._id });
  } catch (err) {
    console.error("Erreur lors de la création de la room:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMatchRoom = async (req, res) => {
  try {
    const room = await MatchRoom.findOne({ roomId: req.params.roomId }).populate(
      "participants",
      "name email"
    );
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }
    res.status(200).json({ roomId: room.roomId, _id: room._id, participants: room.participants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};