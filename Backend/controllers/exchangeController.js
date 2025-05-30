// controllers/exchangeRequestController.js

const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid'); // npm install uuid
const Groq = require("groq-sdk"); // ✅ Corrigé en require pour Node.js
const dotenv = require("dotenv");

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ======================= //
// 🔥 Utils
// ======================= //
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SkillBridge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to, "| ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

// ======================= //
// 📥 Create Exchange Request
// ======================= //
exports.createExchangeRequest = async (req, res) => {
  try {
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

// ======================= //
// 📄 Get My Exchange Requests
// ======================= //
exports.getMyExchangeRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await ExchangeRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate("senderId", "name surname email")
      .populate("receiverId", "name surname email");

    res.status(200).json(requests);
  } catch (error) {
    console.error("❌ Error fetching exchange requests:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================= //
// ✅ Respond to Exchange Request
// ======================= //
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
      request.roomId = uuidv4();
    }

    request.status = status;
    await request.save();

    // 🔥 Smart redirect link
    let redirectLink = "http://localhost:5173/messenger";
    const skill = request.skillRequested.toLowerCase();

    if (skill.includes("node.js") || skill.includes("sql") || skill.includes("java") || skill.includes("react") || skill.includes("python")) {
      redirectLink = `http://localhost:5173/code-room/${request.roomId}`;
    } else if (skill.includes("design") || skill.includes("figma") || skill.includes("photoshop")) {
      redirectLink = "http://localhost:5173/design-collab";
    } else if (skill.includes("communication") || skill.includes("soft skills")) {
      redirectLink = "http://localhost:5173/messenger";
    }

    // ✉️ Email depending on accept or reject
    if (status === "accepted") {
      const html = `
        <div>🎉 Your skill exchange request was accepted! <br>
        Click here to continue: <a href="${redirectLink}">Start Exchange</a></div>
      `;
      await sendEmail(request.senderId.email, "🎉 Skill Exchange Accepted!", html);

    } else if (status === "rejected") {
      const html = `
        <div>❌ Unfortunately, your skill exchange request was rejected.<br>
        Explore more on <a href="http://localhost:5173/publications">SkillBridge</a></div>
      `;
      await sendEmail(request.senderId.email, "❌ Skill Exchange Rejected", html);
    }

    res.status(200).json({ message: `Request ${status}`, request, roomId: status === "accepted" ? request.roomId : null });

  } catch (error) {
    console.error("❌ Error responding to request:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================= //
// 🎯 Validate Exchange
// ======================= //
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

    // ⚡ Check if both users validated successfully
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
        // 🧠 Ajout des compétences échangées
        if (!sender.Skill.includes(request.skillOffered)) {
          sender.Skill.push(request.skillOffered);
        }
        if (!receiver.Skill.includes(request.skillRequested)) {
          receiver.Skill.push(request.skillRequested);
        }

        // 🏆 Incrémenter successfulExchanges
        sender.successfulExchanges = (sender.successfulExchanges || 0) + 1;
        receiver.successfulExchanges = (receiver.successfulExchanges || 0) + 1;

        // 🚀 Mettre à jour le niveau automatiquement
        sender.level = calculateLevel(sender.successfulExchanges);
        receiver.level = calculateLevel(receiver.successfulExchanges);

        await sender.save();
        await receiver.save();
      }

      console.log("✅ Skills and Levels updated successfully for sender and receiver");
    }

    res.status(200).json({ message: "Validation recorded successfully ✅" });

  } catch (error) {
    console.error("❌ Error validating exchange:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Fonction pour calculer le niveau
function calculateLevel(successfulExchanges) {
  if (successfulExchanges >= 50) return 6;
  if (successfulExchanges >= 30) return 5;
  if (successfulExchanges >= 20) return 4;
  if (successfulExchanges >= 10) return 3;
  if (successfulExchanges >= 5) return 2;
  return 1;
}


// ======================= //
// 🛠 Fix Code using AI (Groq)
// ======================= //
exports.fixCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    const prompt = `You are a code fixer. Strictly correct and optimize the following ${language} code.
Respond ONLY with the corrected code, no explanation.

Code to fix:
${code}
`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }]
    });

    const fixedCode = response.choices[0].message.content.trim();

    res.status(200).json({ fixedCode });

  } catch (error) {
    console.error("❌ Groq AI Error:", error.message);
    res.status(500).json({ message: "AI error with Groq." });
  }
};


exports.explainCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    const prompt = `You are an expert developer. Please explain the following ${language} code in clear and concise steps:

\`\`\`${language}
${code}
\`\`\`

Return the explanation in markdown format.`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }]
    });

    const explanation = response.choices[0].message.content.trim();
    res.status(200).json({ explanation });

  } catch (error) {
    console.error("❌ Groq AI Error (explain):", error.message);
    res.status(500).json({ message: "AI error while explaining the code." });
  }
};

exports.generateCode = async (req, res) => {
  const { prompt, language } = req.body;
  const fullPrompt = `Generate a valid, working example of ${language} code that does the following: ${prompt}.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: fullPrompt }]
    });

    const generatedCode = response.choices[0].message.content;
    res.status(200).json({ generatedCode });

  } catch (err) {
    console.error("AI Code Generation Error:", err);
    res.status(500).json({ message: "Failed to generate code." });
  }
};

// exports.generateQuizFromCode = async (req, res) => {
//   try {
//     const { code, language } = req.body;

//     const prompt = `Generate a short quiz based on the following ${language} code.
// Return exactly two multiple-choice questions as a JSON array.
// Each question should follow this format:

// {
//   "question": "string",
//   "options": ["string", "string", "string", "string"],
//   "answer": "string"
// }

// ⚠️ Return ONLY the pure JSON array. Do not include any explanation or text outside the JSON.
// Do not use backticks or Markdown formatting.

// Code:
// ${code}
// `;

//     const response = await groq.chat.completions.create({
//       model: "llama3-8b-8192",
//       messages: [{ role: "user", content: prompt }],
//     });

//     const aiRaw = response.choices[0].message.content.trim();
//     console.log("🧠 RAW AI Response:", aiRaw);

//     // Match first JSON array found
//     const match = aiRaw.match(/\[[\s\S]*\]/);
//     if (!match) {
//       return res.status(500).json({ message: "Invalid quiz format received from AI" });
//     }

//     let cleaned = match[0]
//       .replace(/`/g, '"')     // convert backticks to double quotes
//       .replace(/\s+/g, ' ')   // collapse excessive whitespace
//       .replace(/\\"/g, '"');  // unescape stray escapes

//     let quiz;
//     try {
//       quiz = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ Failed to parse cleaned JSON:", cleaned);
//       return res.status(500).json({ message: "Invalid JSON format extracted" });
//     }

//     res.status(200).json({ quiz });

//   } catch (err) {
//     console.error("❌ Error generating quiz:", err.message);
//     res.status(500).json({ message: "Error generating quiz" });
//   }
// };
exports.generateQuizFromCode = async (req, res) => {
  try {
    const { code, language, answers } = req.body; // on récupère aussi answers

    const prompt = `Generate a short quiz based on the following ${language} code.
Return exactly two multiple-choice questions as a JSON array.
Each question should follow this format:

{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "answer": "string"
}

⚠️ Return ONLY the pure JSON array. Do not include any explanation or text outside the JSON.
Do not use backticks or Markdown formatting.

Code:
${code}
`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
    });

    const aiRaw = response.choices[0].message.content.trim();
    console.log("🧠 RAW AI Response:", aiRaw);

    // Match first JSON array found
    const match = aiRaw.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ message: "Invalid quiz format received from AI" });
    }

    let cleaned = match[0]
      .replace(/`/g, '"')     // convert backticks to double quotes
      .replace(/\s+/g, ' ')   // collapse excessive whitespace
      .replace(/\\"/g, '"');  // unescape stray escapes

    let quiz;
    try {
      quiz = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse cleaned JSON:", cleaned);
      return res.status(500).json({ message: "Invalid JSON format extracted" });
    }

    // ✅ Si des réponses utilisateur sont envoyées, ajouter isCorrect
    if (Array.isArray(answers) && answers.length === quiz.length) {
      quiz = quiz.map((q, i) => {
        const expected = q.answer?.trim().toLowerCase();
        const given = answers[i]?.trim().toLowerCase();
        return {
          ...q,
          isCorrect: expected === given
        };
      });
    }

    res.status(200).json({ quiz });

  } catch (err) {
    console.error("❌ Error generating quiz:", err.message);
    res.status(500).json({ message: "Error generating quiz" });
  }
};
