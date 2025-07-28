import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAIInsights,
  getDebtorAnalysis,
  getPaymentPredictions,
  getRiskAssessment,
  getComprehensiveAnalysis,
} from "../controllers/aiController";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get comprehensive AI insights for the user
router.get("/insights", getAIInsights);

// Get analysis for a specific debtor
router.get("/debtor/:debtorId/analysis", getDebtorAnalysis);

// Get payment predictions for all debtors
router.get("/predictions", getPaymentPredictions);

// Get risk assessment for the portfolio
router.get("/risk-assessment", getRiskAssessment);

// Get comprehensive analysis (all insights combined)
router.get("/comprehensive", getComprehensiveAnalysis);

export default router;
