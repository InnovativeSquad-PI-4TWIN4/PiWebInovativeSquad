const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User"); 
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid'); // npm install uuid

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

    const request = await ExchangeRequest.findById(requestId)
      .populate("senderId", "name surname email")
      .populate("receiverId", "name surname email");

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (status === "accepted") {
      const roomId = uuidv4(); // ✅ Créer un roomId unique
      request.roomId = roomId;
    }

    request.status = status;
    await request.save();

    // 🔥 🔥 🔥 Redirection dynamique en fonction du skill demandé
    let redirectLink = "http://localhost:5173/messenger"; // valeur par défaut
    const skill = request.skillRequested.toLowerCase();

    if (skill.includes("node.js") || skill.includes("sql") || skill.includes("Java") || skill.includes("React")|| skill.includes("Python")) {
      redirectLink = `http://localhost:5173/code-room/${request.roomId}`; // Correct: utiliser `` au lieu de ""
    } else if (skill.includes("design") || skill.includes("figma") || skill.includes("photoshop")) {
      redirectLink = "http://localhost:5173/design-collab";
    } else if (skill.includes("communication") || skill.includes("soft skills")) {
      redirectLink = "http://localhost:5173/messenger";
    }

    // ✉️ Contenu d'email différent selon accept/reject
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

              <p>You're now connected. Click below to continue the exchange:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${redirectLink}" style="padding: 12px 24px; background-color: #1DA1F2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  🚀 Start Exchange
                </a>
              </div>    

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
    } else if (status === "rejected") {
      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #fff6f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #e74c3c; padding: 20px; color: white;">
              <h2 style="margin: 0;">❌ Skill Exchange Rejected</h2>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Hello <strong>${request.senderId.name}</strong>,</p>
              <p>Unfortunately, your request for a skill exchange with <strong>${request.receiverId.name} ${request.receiverId.surname}</strong> was <strong style="color: red;">rejected</strong>.</p>

              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                <p>💡 <strong>Skill You Offered:</strong> ${request.skillOffered}</p>
                <p>🎯 <strong>Skill You Wanted:</strong> ${request.skillRequested}</p>
              </div>

              <p style="font-size: 0.9em; color: #999;">Don't worry! You can explore other exchange opportunities on <a href="http://localhost:5173/publications" style="color: #e74c3c;">SkillBridge</a>.</p>
            </div>
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
              © 2025 SkillBridge. All rights reserved.
            </div>
          </div>
        </div>
      `;

      await sendEmail(
        request.senderId.email,
        "❌ Your Skill Exchange Was Rejected",
        html
      );
    }

    // ✅ Response avec RoomId si status === accepted
    res.status(200).json({ message: `Request ${status}`, request, roomId: status === "accepted" ? request.roomId : null });

  } catch (error) {
    console.error("❌ Error responding to request:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// ✅ Valider l'échange
exports.validateExchange = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, result } = req.body;

    const request = await ExchangeRequest.findOne({ roomId });
    if (!request) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    if (!request.validations) {
      request.validations = [];
    }

    request.validations.push({
      userId,
      result,
      validatedAt: new Date(),
    });

    await request.save();

    const allValidated = request.validations.length >= 2 &&
      request.validations.every(v => v.result === "success");

    if (allValidated) {
      const io = req.app.get("io");
      if (io) {
        io.to(request.roomId).emit("exchange-completed");
      }

      const sender = await User.findById(request.senderId);
      const receiver = await User.findById(request.receiverId);

      if (sender && receiver) {
        if (!sender.Skill.includes(request.skillOffered)) {
          sender.Skill.push(request.skillOffered);
        }
        if (!receiver.Skill.includes(request.skillRequested)) {
          receiver.Skill.push(request.skillRequested);
        }

        await sender.save();
        await receiver.save();
      }

      console.log("✅ Skills updated successfully for sender and receiver");
    }

    res.status(200).json({ message: "Validation recorded successfully ✅" });
  } catch (error) {
    console.error("❌ Error validating exchange:", error);
    res.status(500).json({ message: "Server error" });
  }
};
