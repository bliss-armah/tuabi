import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import aiService from "../services/aiService";

export const getAIInsights = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    // Check if AI service is healthy
    const isHealthy = await aiService.checkHealth();
    if (!isHealthy) {
      res.status(503).json({
        success: false,
        message: "AI service is currently unavailable",
      });
      return;
    }

    // Get comprehensive AI analysis
    const insights = await aiService.getComprehensiveAnalysis(userId);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Get AI insights error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI insights",
    });
  }
};

export const getRiskAssessment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { debtorId } = req.query;

    const assessments = await aiService.getRiskAssessment(
      userId,
      debtorId ? parseInt(debtorId as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error("Get risk assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get risk assessment",
    });
  }
};

export const getPaymentPredictions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { debtorId } = req.query;

    const predictions = await aiService.getPaymentPredictions(
      userId,
      debtorId ? parseInt(debtorId as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error("Get payment predictions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment predictions",
    });
  }
};

export const getCashFlowForecast = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const forecast = await aiService.getCashFlowPrediction(userId);

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Get cash flow forecast error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cash flow forecast",
    });
  }
};

export const getAIRecommendations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const recommendations = await aiService.getRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Get AI recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI recommendations",
    });
  }
};

export const retrainAIModels = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // This could be restricted to admin users only
    const result = await aiService.retrainModels();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Retrain AI models error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrain AI models",
    });
  }
};

export const getAIStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isHealthy = await aiService.checkHealth();
    const modelStatus = isHealthy ? await aiService.getModelStatus() : [];

    res.status(200).json({
      success: true,
      data: {
        service_healthy: isHealthy,
        models: modelStatus,
      },
    });
  } catch (error) {
    console.error("Get AI status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI status",
    });
  }
};
