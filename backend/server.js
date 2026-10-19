
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import bloodRequestRoutes from "./routes/bloodRequestRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(morgan("dev"));

app.use("/api/blood-requests", bloodRequestRoutes);

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

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`LifeLink server running on port ${PORT}`);
  });
};

startServer();
