const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User"); 
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ex: "yourmail@gmail.com"
        pass: process.env.EMAIL_PASS, // un mot de passe d'application si tu utilises Gmail
      },
    });

    const mailOptions = {
      from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé à :", to, "| ID:", info.messageId);
  } catch (error) {
    console.error("❌ Échec de l'envoi d'e-mail à", to, "| Erreur:", error.message);
  }
};

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
    )
      .populate("senderId", "name surname email")
      .populate("receiverId", "name surname email");

    // ✅ Si accepté, envoyer un mail
    if (status === "accepted") {
      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #1DA1F2; padding: 20px; color: white;">
              <h2 style="margin: 0;">🎉 Skill Exchange Accepted!</h2>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Hi <strong>${request.senderId.name}</strong>,</p>
              <p>Your skill exchange request has been <strong style="color: green;">accepted</strong> by <strong>${request.receiverId.name} ${request.receiverId.surname}</strong>.</p>

              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1DA1F2; margin: 20px 0;">
                <p>💡 <strong>Skill You Offer:</strong> ${request.skillOffered}</p>
                <p>🎯 <strong>Skill You Learn:</strong> ${request.skillRequested}</p>
              </div>

              <p>You can now chat using <a href="http://localhost:5173/messenger" style="color: #1DA1F2;">SkillBridge Messenger</a>.</p>

              <p style="font-size: 0.9em; color: #999;">If you did not request this, please ignore this message.</p>
            </div>
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
              © 2025 SkillBridge. All rights reserved.
            </div>
          </div>
        </div>
      `;

      await sendEmail(
        request.senderId.email,
        "🎉 Your Skill Exchange Was Accepted!",
        html
      );
    }

    res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    console.error("❌ Error responding to request:", error);
    res.status(500).json({ message: "Server error." });
  }
};
