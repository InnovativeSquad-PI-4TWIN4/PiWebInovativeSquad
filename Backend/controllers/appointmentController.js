const Appointment = require("../models/Appointment");

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
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("❌ Erreur création rendez-vous :", error);
    res.status(500).json({ message: "Erreur création rdv", error });
  }
};

exports.getUserAppointments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const appointments = await Appointment.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    }).populate("fromUser toUser", "name email");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Erreur récupération rendez-vous :", error);
    res.status(500).json({ message: "Erreur récupération rdv", error });
  }
};
