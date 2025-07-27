import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/Shared/Api/config";

export interface RiskAssessment {
  debtor_id: number;
  risk_level: "low" | "medium" | "high";
  risk_score: number;
  confidence: number;
  factors: string[];
}

export interface PaymentPrediction {
  debtor_id: number;
  predicted_payment_date: string | null;
  prediction_confidence: number;
  predicted_amount: number | null;
  likelihood_of_payment: number;
}

export interface CashFlowPrediction {
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

export interface SmartRecommendation {
  debtor_id: number;
  recommendation_type: string;
  message: string;
  priority: number;
  suggested_action: string;
  optimal_time: string | null;
}

export interface UserInsightsResponse {
  user_id: number;
  risk_assessments: RiskAssessment[];
  payment_predictions: PaymentPrediction[];
  cash_flow_prediction: CashFlowPrediction;
  recommendations: SmartRecommendation[];
  generated_at: string;
}

export interface AIStatus {
  service_healthy: boolean;
  models: Array<{
    model_name: string;
    is_trained: boolean;
    last_trained: string | null;
    accuracy_score: number | null;
    sample_size: number;
  }>;
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery,
  tagTypes: [
    "AIInsights",
    "RiskAssessment",
    "PaymentPredictions",
    "Recommendations",
  ],
  endpoints: (builder) => ({
    getAIInsights: builder.query<
      { success: boolean; data: UserInsightsResponse },
      void
    >({
      query: () => "/ai/insights",
      providesTags: ["AIInsights"],
    }),

    getRiskAssessment: builder.query<
      { success: boolean; data: RiskAssessment[] },
      { debtorId?: number }
    >({
      query: ({ debtorId }) => ({
        url: "/ai/risk-assessment",
        params: debtorId ? { debtorId } : undefined,
      }),
      providesTags: ["RiskAssessment"],
    }),

    getPaymentPredictions: builder.query<
      { success: boolean; data: PaymentPrediction[] },
      { debtorId?: number }
    >({
      query: ({ debtorId }) => ({
        url: "/ai/payment-predictions",
        params: debtorId ? { debtorId } : undefined,
      }),
      providesTags: ["PaymentPredictions"],
    }),

    getCashFlowForecast: builder.query<
      { success: boolean; data: CashFlowPrediction },
      void
    >({
      query: () => "/ai/cash-flow-forecast",
    }),

    getRecommendations: builder.query<
      { success: boolean; data: SmartRecommendation[] },
      void
    >({
      query: () => "/ai/recommendations",
      providesTags: ["Recommendations"],
    }),

    getAIStatus: builder.query<{ success: boolean; data: AIStatus }, void>({
      query: () => "/ai/status",
    }),

    retrainModels: builder.mutation<
      { success: boolean; data: { message: string } },
      void
    >({
      query: () => ({
        url: "/ai/retrain-models",
        method: "POST",
      }),
      invalidatesTags: [
        "AIInsights",
        "RiskAssessment",
        "PaymentPredictions",
        "Recommendations",
      ],
    }),
  }),
});

export const {
  useGetAIInsightsQuery,
  useGetRiskAssessmentQuery,
  useGetPaymentPredictionsQuery,
  useGetCashFlowForecastQuery,
  useGetRecommendationsQuery,
  useGetAIStatusQuery,
  useRetrainModelsMutation,
} = aiApi;
