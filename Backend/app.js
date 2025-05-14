const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");
const { Server } = require("socket.io");

require("dotenv").config();
const mongoConn = require("./config/DataBase.json");
let currentCode = "// shared editor content";
const codeRooms = {};
const matchRooms = {};

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const premiumRouter = require("./routes/premiumCourses");
const coursesRouter = require("./routes/courses");
const notesRouter = require("./routes/notes");
const avisRouter = require("./routes/Avis");
const packRoutes = require("./routes/pack");
const publicationRouter = require("./routes/publication");
const messageRouter = require("./routes/message");
const stripeRouter = require("./routes/stripe");
const chatRoutes = require("./routes/chatRoutes");
const favoritesRoutes = require("./routes/favorites");
const quizResultRoutes = require("./routes/quizResult.routes");
const emailRoutes = require("./routes/email.routes");
const examAIRoutes = require("./routes/examAI.routes");
const exchangeRoutes = require('./routes/exchangeRoutes');
const appointmentRoutes = require("./routes/appointments");
const wheelRoutes = require("./routes/wheel.routes");
const robotRoutes = require('./routes/robot.routes');
const matchRequestRoutes = require("./routes/matchRequest.routes");
const learningCircleRoutes = require("./routes/LearningCircleRoutes");
const matchChatRoutes = require("./routes/matchChat.routes");
const matchRoomRoutes = require("./routes/MatchRoomRoutes");
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const sprintAIRoutes = require("./routes/sprintAI.routes");


const app = express();
const server = http.createServer(app);

const onlineUsers = new Map(); // Utiliser Map pour associer userId à socketId
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Passer l'instance io à l'application pour les contrôleurs
app.set("socketio", io);
app.set("onlineUsers", onlineUsers);


const participants = {};

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client connecté:", socket.id);

  socket.on("join", (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id); // Associer userId à socketId
    io.emit("onlineUsers", Array.from(onlineUsers.keys()).map(id => id.toString()));
    console.log(`Utilisateur ${userId} connecté`);
  });

  socket.on("match-updated", ({ matchId, status, roomId, senderId, receiverId }) => {
    console.log("Server received match-updated:", { matchId, status, roomId, senderId, receiverId }); // Log pour débogage
    // Notifier les deux utilisateurs concernés
    const senderSocketId = onlineUsers.get(senderId);
    const receiverSocketId = onlineUsers.get(receiverId);

    const updatedMatch = { matchId, status, roomId };

    if (senderSocketId && senderSocketId !== socket.id) { // Éviter d'envoyer à l'émetteur
      io.to(senderSocketId).emit("match-updated", updatedMatch);
    }
    if (receiverSocketId && receiverSocketId !== socket.id) { // Éviter d'envoyer à l'émetteur
      io.to(receiverSocketId).emit("match-updated", updatedMatch);
    }
  });

  // === Section 1 : Travail d'Ali - Rooms de collaboration générale ===
  socket.on("join-room", ({ roomId, userId, userName }) => {
    socket.join(roomId);
    console.log(`✅ ${socket.id} joined room ${roomId} with userId ${userId} and name ${userName}`);

    if (!participants[roomId]) participants[roomId] = [];
    if (!participants[roomId].some(p => p.userId === userId)) {
      participants[roomId].push({ userId, userName, joinedAt: new Date() });
    }
    socket.to(roomId).emit("user-joined", { userId, userName, participants: participants[roomId] });

    if (codeRooms[roomId]) {
      socket.emit("init", codeRooms[roomId]);
    } else {
      codeRooms[roomId] = "// Start collaborating!";
      socket.emit("init", codeRooms[roomId]);
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    codeRooms[roomId] = code;
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("leave-room", ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`❌ ${socket.id} left room ${roomId} with userId ${userId}`);
    if (participants[roomId]) {
      participants[roomId] = participants[roomId].map((p) =>
        p.userId === userId ? { ...p, leftAt: new Date() } : p
      );
      io.to(roomId).emit("user-left", { userId, userName: participants[roomId].find(p => p.userId === userId)?.userName, participants: participants[roomId] });
    }
  });

  socket.on("make-call", ({ offer, roomId, to }) => {
    console.log(`Appel initié de ${socket.id} vers ${to} dans la salle ${roomId}`);
    io.to(to).emit("call-made", { offer, from: socket.id });
  });

  socket.on("make-answer", ({ answer, to }) => {
    console.log(`Réponse envoyée de ${socket.id} à ${to}`);
    io.to(to).emit("answer-made", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, roomId, to }) => {
    console.log(`ICE candidate envoyé de ${socket.id} à ${to} dans la salle ${roomId}`);
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callIncoming", { signal: signalData, from, name });
  });

  socket.on("send-message", ({ roomId, userId, userName, message }) => {
    socket.to(roomId).emit("receive-message", { userId, userName, message });
  });

  // === Section 2 : Rooms de match limitées à 2 participants ===
  socket.on("join-match-room", ({ roomId, userId, userName }) => {
    if (participants[roomId]) {
      socket.emit("room-conflict", { message: "Cette room est déjà utilisée pour une collaboration générale." });
      return;
    }

    socket.join(roomId);
    console.log(`✅ ${socket.id} joined match room ${roomId} with userId ${userId} and name ${userName}`);

    if (!matchRooms[roomId]) {
      matchRooms[roomId] = [];
    }

    if (matchRooms[roomId].length >= 2 && !matchRooms[roomId].some(p => p.userId === userId)) {
      socket.emit("room-full", { message: "Cette room est limitée à 2 participants." });
      socket.leave(roomId);
      return;
    }

    if (!matchRooms[roomId].some(p => p.userId === userId)) {
      matchRooms[roomId].push({ userId, userName, socketId: socket.id, joinedAt: new Date() });
    }

    socket.to(roomId).emit("user-joined-match", { userId, userName, participants: matchRooms[roomId] });
    socket.emit("match-room-joined", { participants: matchRooms[roomId] });

    // Lancer automatiquement l'appel vidéo pour le deuxième utilisateur
    if (matchRooms[roomId].length === 2) {
      const [user1, user2] = matchRooms[roomId];
      io.to(user1.socketId).emit("start-call", { userToCall: user2.userId, name: user1.userName });
      io.to(user2.socketId).emit("start-call", { userToCall: user1.userId, name: user2.userName });
    }
  });

  socket.on("send-match-message", ({ roomId, userId, userName, message }) => {
    io.to(roomId).emit("receive-match-message", { userId, userName, message, timestamp: new Date().toISOString() });
  });

  socket.on("make-match-call", ({ offer, roomId, to }) => {
    console.log(`Appel match initié de ${socket.id} vers ${to} dans la salle ${roomId}`);
    io.to(to).emit("match-call-made", { offer, from: socket.id });
  });

  socket.on("make-match-answer", ({ answer, to }) => {
    console.log(`Réponse match envoyée de ${socket.id} à ${to}`);
    io.to(to).emit("match-answer-made", { answer, from: socket.id });
  });

  socket.on("ice-match-candidate", ({ candidate, roomId, to }) => {
    console.log(`ICE candidate match envoyé de ${socket.id} à ${to} dans la salle ${roomId}`);
    io.to(to).emit("ice-match-candidate", { candidate, from: socket.id });
  });

  socket.on("callMatchUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("matchCallIncoming", { signal: signalData, from, name });
  });

  socket.on("leave-match-room", ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`❌ ${socket.id} left match room ${roomId} with userId ${userId}`);
    if (matchRooms[roomId]) {
      matchRooms[roomId] = matchRooms[roomId].map((p) =>
        p.userId === userId ? { ...p, leftAt: new Date() } : p
      );
      io.to(roomId).emit("user-left-match", { userId, userName: matchRooms[roomId].find(p => p.userId === userId)?.userName, participants: matchRooms[roomId] });
    }
  });

  socket.on("typing", ({ toUserId, fromUser }) => {
    socket.to(toUserId).emit("userTyping", fromUser);
  });

  socket.on("stopTyping", ({ toUserId }) => {
    socket.to(toUserId).emit("userStopTyping");
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()).map(id => id.toString()));
      console.log(`🔴 Client déconnecté: ${socket.id} (userId: ${socket.userId})`);

      Object.keys(participants).forEach((roomId) => {
        if (participants[roomId].some(p => p.userId === socket.userId)) {
          participants[roomId] = participants[roomId].map((p) =>
            p.userId === socket.userId ? { ...p, leftAt: new Date() } : p
          );
          io.to(roomId).emit("user-left", { userId: socket.userId, userName: participants[roomId].find(p => p.userId === socket.userId)?.userName, participants: participants[roomId] });
        }
      });

      Object.keys(matchRooms).forEach((roomId) => {
        if (matchRooms[roomId].some(p => p.userId === socket.userId)) {
          matchRooms[roomId] = matchRooms[roomId].map((p) =>
            p.userId === socket.userId ? { ...p, leftAt: new Date() } : p
          );
          io.to(roomId).emit("user-left-match", { userId: socket.userId, userName: matchRooms[roomId].find(p => p.userId === socket.userId)?.userName, participants: matchRooms[roomId] });
        }
      });
    }
  });
});

// Middleware et configuration Express
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(mongoConn.url)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/auth", authRouter);
app.use("/index", indexRouter);
app.use("/users", usersRouter);
app.use("/courses", coursesRouter);
app.use("/api/notes", notesRouter);
app.use("/premium", premiumRouter);
app.use("/avis", avisRouter);
app.use("/packs", packRoutes);
app.use("/publication", publicationRouter);
app.use("/messages", messageRouter);
app.use("/api/stripe", stripeRouter);
app.use("/chat", chatRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/api/quiz-result", quizResultRoutes);
app.use("/api/email", emailRoutes);
app.use("/chat", publicationRouter);
app.use("/api/exam-ai", examAIRoutes);
app.use("/exchange-request", exchangeRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/recommendation", require("./routes/recommendation.routes"));
app.use("/api", require("./routes/skillsRecommendation"));
app.use("/api/wheel", wheelRoutes);
app.use('/api/robot', robotRoutes);
app.use("/match-request", matchRequestRoutes);
app.use("/api/circles", learningCircleRoutes);
app.use("/api/match-chat", matchChatRoutes);
app.use("/api/match-rooms", matchRoomRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/sprint", sprintAIRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: "❌ La page demandée n'a pas été trouvée !" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Erreur interne du serveur";
  res.status(status).json({
    error: req.app.get("env") === "development" ? message : "Une erreur est survenue",
    ...(req.app.get("env") === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


module.exports = app;

