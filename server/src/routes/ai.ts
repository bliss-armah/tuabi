import express from "express";
import {
  getAIInsights,
  getRiskAssessment,
  getPaymentPredictions,
  getCashFlowForecast,
  getAIRecommendations,
  retrainAIModels,
  getAIStatus,
} from "../controllers/aiController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// Get comprehensive AI insights
router.get("/insights", getAIInsights);

// Get specific AI analyses
router.get("/risk-assessment", getRiskAssessment);
router.get("/payment-predictions", getPaymentPredictions);
router.get("/cash-flow-forecast", getCashFlowForecast);
router.get("/recommendations", getAIRecommendations);

// AI management endpoints
router.post("/retrain-models", retrainAIModels);
router.get("/status", getAIStatus);

export default router;
