import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import debtorRoutes from "./routes/debtor";
import debtHistoryRoutes from "./routes/debtHistory";
import subscriptionRoutes from "./routes/subscription";
import reminderRoutes from "./routes/reminderRoutes";
import pushTokenRoutes from "./routes/pushToken";
import queueRoutes from "./routes/queueRoutes";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/debtors", debtorRoutes);
app.use("/api/debt-history", debtHistoryRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/push-token", pushTokenRoutes);
app.use("/api/queue", queueRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`💡 Start the notification worker with: npm run worker:dev`);
});

export default app;
