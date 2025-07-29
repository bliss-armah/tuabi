import axios, { AxiosInstance } from "axios";

interface RiskAssessment {
  debtor_id: number;
  risk_level: "low" | "medium" | "high";
  risk_score: number;
  confidence: number;
  factors: string[];
}

interface PaymentPrediction {
  debtor_id: number;
  predicted_payment_date: string | null;
  prediction_confidence: number;
  predicted_amount: number | null;
  likelihood_of_payment: number;
}

interface CashFlowPrediction {
  user_id: number;
  predictions: Array<{
    month: string;
    expected_amount: number;
  }>;
  total_expected: number;
  confidence_interval: {
    low: number;
    high: number;
  };
}

interface SmartRecommendation {
  debtor_id: number;
  recommendation_type: string;
  message: string;
  priority: number;
  suggested_action: string;
  optimal_time: string | null;
}

interface UserInsightsResponse {
  user_id: number;
  risk_assessments: RiskAssessment[];
  payment_predictions: PaymentPrediction[];
  cash_flow_prediction: CashFlowPrediction;
  recommendations: SmartRecommendation[];
  generated_at: string;
}

class AIService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || "http://localhost:8000";
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `AI Service Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("AI Service Request Error:", error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `AI Service Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      (error) => {
        console.error(
          "AI Service Response Error:",
          error.response?.status,
          error.message
        );
        return Promise.reject(error);
      }
    );
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.data.status === "healthy" && response.data.model_loaded;
    } catch (error) {
      console.error("AI Service health check failed:", error);
      return false;
    }
  }

  async getRiskAssessment(
    userId: number,
    debtorId?: number
  ): Promise<RiskAssessment[]> {
    try {
      const endpoint = debtorId
        ? `/api/v1/predictions/risk-assessment/${userId}?debtor_id=${debtorId}`
        : `/api/v1/predictions/risk-assessment/${userId}`;

      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error getting risk assessment:", error);
      throw new Error("Failed to get risk assessment from AI service");
    }
  }

  async getPaymentPredictions(
    userId: number,
    debtorId?: number
  ): Promise<PaymentPrediction[]> {
    try {
      const endpoint = debtorId
        ? `/api/v1/predictions/payment-predictions/${userId}?debtor_id=${debtorId}`
        : `/api/v1/predictions/payment-predictions/${userId}`;

      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error getting payment predictions:", error);
      throw new Error("Failed to get payment predictions from AI service");
    }
  }

  async getCashFlowPrediction(userId: number): Promise<CashFlowPrediction> {
    try {
      const response = await this.client.get(
        `/api/v1/predictions/cash-flow/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting cash flow prediction:", error);
      throw new Error("Failed to get cash flow prediction from AI service");
    }
  }

  async getRecommendations(userId: number): Promise<SmartRecommendation[]> {
    try {
      const response = await this.client.get(
        `/api/v1/insights/recommendations/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw new Error("Failed to get recommendations from AI service");
    }
  }

  async getComprehensiveAnalysis(
    userId: number
  ): Promise<UserInsightsResponse> {
    try {
      const response = await this.client.get(
        `/api/v1/insights/comprehensive-analysis/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting comprehensive analysis:", error);
      throw new Error("Failed to get comprehensive analysis from AI service");
    }
  }

  async retrainModels(): Promise<{ message: string }> {
    try {
      const response = await this.client.post(
        "/api/v1/insights/retrain-models",
        {
          retrain_models: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error retraining models:", error);
      throw new Error("Failed to retrain models");
    }
  }

  async getModelStatus(): Promise<any[]> {
    try {
      const response = await this.client.get("/api/v1/insights/model-status");
      return response.data;
    } catch (error) {
      console.error("Error getting model status:", error);
      throw new Error("Failed to get model status");
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
