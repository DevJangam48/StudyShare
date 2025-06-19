const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const accessRoutes = require("./routes/access");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/user");

// Initialize
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server for socket.io

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ Replace with your frontend URL in production
    credentials: true,
  },
});

// Make socket.io globally available
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.io logic
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Listen for user to join their room
  socket.on("join", (userId) => {
    console.log(`User ${userId} joined room`);
    socket.join(userId); // Join a room named by userId
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
