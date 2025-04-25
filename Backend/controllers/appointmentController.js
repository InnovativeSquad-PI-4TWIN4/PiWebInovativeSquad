const Appointment = require("../models/Appointment");

// ✅ Créer une nouvelle session
exports.createAppointment = async (req, res) => {
  const { fromUser, toUser, skill, date } = req.body;
  const link = `https://meet.jit.si/SkillBridge-${fromUser}-${Date.now()}`;

  try {
    const appointment = await Appointment.create({
      fromUser,
      toUser,
      skill,
      date,
      link,
      status: "pending", // par défaut (optionnel ici car déjà dans le modèle)
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("❌ Erreur création rendez-vous :", error);
    res.status(500).json({ message: "Erreur création rdv", error });
  }
};

// ✅ Récupérer tous les rendez-vous pour un utilisateur
exports.getUserAppointments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const appointments = await Appointment.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    }).populate("fromUser toUser", "name surname email");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Erreur récupération rendez-vous :", error);
    res.status(500).json({ message: "Erreur récupération rdv", error });
  }
};

// ✅ Accepter ou refuser une invitation
exports.updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body; // attendu : "accepted" ou "rejected"

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    res.status(200).json({ message: "Statut mis à jour", appointment: updated });
  } catch (error) {
    console.error("❌ Erreur MAJ statut :", error);
    res.status(500).json({ message: "Erreur mise à jour statut", error });
  }
};
