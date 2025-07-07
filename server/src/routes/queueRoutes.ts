import express from "express";
import { authenticateToken } from "../middleware/auth";
import queueService from "../services/queueService";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get queue statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await queueService.getQueueStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get queue statistics",
    });
  }
});

// Clean up old jobs
router.post("/cleanup", async (req, res) => {
  try {
    await queueService.cleanupJobs();
    res.status(200).json({
      success: true,
      message: "Queue cleanup completed",
    });
  } catch (error) {
    console.error("Error cleaning up queue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clean up queue",
    });
  }
});

export default router;
