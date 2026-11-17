
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";
import donorNotificationRoutes from "./routes/donorNotificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import { socketAuthMiddleware } from "./middleware/socketAuthMiddleware.js";
import { startBloodRequestScheduler } from "./services/bloodRequestScheduler.js";
import Chat from "./models/Chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donor-notifications", donorNotificationRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LifeLink API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LifeLink server is healthy",
    timestamp: new Date().toISOString(),
  });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO accessible from controllers
app.set("io", io);

io.use(socketAuthMiddleware);

io.engine.on("connection_error", (err) => {
  console.log("Socket.IO connection error:");
  console.log("Code:", err.code);
  console.log("Message:", err.message);
  console.log("Context:", err.context);
});

io.on("connection", (socket) => {
  console.log("LifeLink Socket connected:", socket.id);
  console.log("Authenticated user:", socket.user.name);

  // Join a chat room securely
  socket.on("chat:join", async (chatId) => {
    try {
      if (
        typeof chatId !== "string" ||
        !/^[0-9a-fA-F]{24}$/.test(chatId)
      ) {
        return socket.emit("chat:error", {
          message: "Invalid chat ID",
        });
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) {
        return socket.emit("chat:error", {
          message: "You are not authorized to join this chat",
        });
      }

      const roomName = `chat:${chatId}`;

      await socket.join(roomName);

      socket.emit("chat:joined", {
        success: true,
        chatId,
        message: "Successfully joined chat room",
      });

      console.log(`${socket.user.name} joined ${roomName}`);
    } catch (error) {
      console.error("Chat room join error:", error.message);

      socket.emit("chat:error", {
        message: "Unable to join chat room",
      });
    }
  });

  // Leave a chat room
  socket.on("chat:leave", async (chatId) => {
    try {
      if (
        typeof chatId !== "string" ||
        !/^[0-9a-fA-F]{24}$/.test(chatId)
      ) {
        return;
      }

      await socket.leave(`chat:${chatId}`);

      socket.emit("chat:left", {
        success: true,
        chatId,
        message: "Successfully left chat room",
      });
    } catch (error) {
      console.error("Chat room leave error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("LifeLink Socket disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`LifeLink server running on port ${PORT}`);
      console.log("LifeLink Socket.IO server is ready");

      startBloodRequestScheduler();
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
