
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";
import donorNotificationRoutes from "./routes/donorNotificationRoutes.js";
import { socketAuthMiddleware } from "./middleware/socketAuthMiddleware.js";

import { startBloodRequestScheduler } from "./services/bloodRequestScheduler.js";
import chatRoutes from "./routes/chatRoutes.js";

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

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log("LifeLink Socket connected:", socket.id);

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
