const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const roomRoutes = require("./routes/roomRoutes");
const Message = require("./models/Message");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => res.send("FlashMail API Running ✅"));

// Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// Socket.io
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

let onlineUsers = new Set();

io.on("connection", (socket) => {
  // Load old messages (Global)
  (async () => {
    try {
      const old = await Message.find({ roomCode: "GLOBAL" })
        .sort({ createdAt: 1 })
        .limit(100);
      socket.emit(
        "loadMessages",
        old.map((m) => ({
          user: m.senderName || "User",
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString(),
        })),
      );
    } catch (e) {}
  })();

  socket.on("join", (username) => {
    socket.data.username = username || "User";
    onlineUsers.add(socket.data.username);
    io.emit("onlineUsers", Array.from(onlineUsers));
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const msg = {
        roomCode: "GLOBAL",
        senderName: data.user || socket.data.username || "User",
        text: data.text || "",
      };

      if (!msg.text.trim()) return;

      const saved = await Message.create(msg);

      io.emit("receiveMessage", {
        user: msg.senderName,
        text: msg.text,
        time: new Date(saved.createdAt).toLocaleTimeString(),
      });
    } catch (e) {}
  });

  socket.on("disconnect", () => {
    if (socket.data.username) onlineUsers.delete(socket.data.username);
    io.emit("onlineUsers", Array.from(onlineUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
