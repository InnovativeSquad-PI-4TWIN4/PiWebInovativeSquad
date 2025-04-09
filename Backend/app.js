const express = require("express");
const http = require("http"); // 👈 pour créer le serveur HTTP
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");
const { Server } = require("socket.io"); // 👈 import de socket.io

require("dotenv").config();
const mongoConn = require("./config/DataBase.json");

// Charger les modèles
require("./models/User");
require("./models/publication");
require("./models/Notification");
require("./models/Chat");
require("./models/Packs");
require("./models/Courses");

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

// ✅ Initialise app Express
const app = express();

// ✅ Création du serveur HTTP pour intégrer Socket.io
const server = http.createServer(app);

// ✅ Intégration de Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const onlineUsers = new Set();

// ✅ Gestion des sockets
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.userId = userId;
    onlineUsers.add(userId);
    io.emit("onlineUsers", Array.from(onlineUsers)); // ✅ envoie à tous
    console.log("🟢 Nouveau client connecté:", socket.id);
  });
  
  io.emit("onlineUsers", Array.from(onlineUsers).map(id => id.toString()));


  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} a rejoint sa room`);
  });

  socket.on("typing", ({ toUserId, fromUser }) => {
    socket.to(toUserId).emit("userTyping", fromUser);
  });

  socket.on("stopTyping", ({ toUserId }) => {
    socket.to(toUserId).emit("userStopTyping");
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("onlineUsers", Array.from(onlineUsers)); // ✅ met à jour
    console.log("🔴 Client déconnecté:", socket.id);

  });
 
});

// ✅ Middleware et configuration Express
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

// ✅ Routes
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

// ✅ Gestion 404
app.use((req, res, next) => {
  res.status(404).json({ error: "❌ La page demandée n'a pas été trouvée !" });
});

// ✅ Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Erreur interne du serveur";
  res.status(status).json({
    error: req.app.get("env") === "development" ? message : "Une erreur est survenue",
    ...(req.app.get("env") === "development" && { stack: err.stack }),
  });
});
// ✅ Démarrer le serveur directement ici
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


module.exports = app