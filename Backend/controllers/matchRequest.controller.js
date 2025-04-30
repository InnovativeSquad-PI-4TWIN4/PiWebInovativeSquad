const MatchRequest = require("../models/MatchRequest");


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
  
      const sent = await MatchRequest.find({ sender: userId })
        .populate("receiver publication");
  
      const received = await MatchRequest.find({ receiver: userId })
        .populate("sender publication");
  
      res.status(200).json({ sent, received });
    } catch (error) {
      console.error("Erreur getUserMatches:", error);
      res.status(500).json({ error: error.message });
    }
  };