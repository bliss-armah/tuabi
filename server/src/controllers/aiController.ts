import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { openRouterService } from "../services/openRouterService";

export const getAIInsights = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const insights = await openRouterService.getUserInsights(userId);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Get AI insights error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get AI insights",
    });
  }
};

export const getDebtorAnalysis = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { debtorId } = req.params;

    if (!debtorId || isNaN(parseInt(debtorId))) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }

    const analysis = await openRouterService.analyzeDebtor(
      userId,
      parseInt(debtorId)
    );

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Get debtor analysis error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to analyze debtor",
    });
  }
};

export const getPaymentPredictions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const predictions = await openRouterService.getPaymentPredictions(userId);

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error("Get payment predictions error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get payment predictions",
    });
  }
};

export const getRiskAssessment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const assessment = await openRouterService.getRiskAssessment(userId);

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Get risk assessment error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get risk assessment",
    });
  }
};

export const getComprehensiveAnalysis = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    // Get all AI insights in parallel
    const [insights, predictions, riskAssessment] = await Promise.all([
      openRouterService.getUserInsights(userId),
      openRouterService.getPaymentPredictions(userId),
      openRouterService.getRiskAssessment(userId),
    ]);

    const comprehensiveAnalysis = {
      insights,
      predictions,
      riskAssessment,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: comprehensiveAnalysis,
    });
  } catch (error) {
    console.error("Get comprehensive analysis error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get comprehensive analysis",
    });
  }
};
