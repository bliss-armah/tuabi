import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";

// AI API
export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery,
  tagTypes: ["AIInsights", "DebtorAnalysis", "Predictions", "RiskAssessment"],
  endpoints: (builder) => ({
    // Get comprehensive user insights
    getUserInsights: builder.query<UserInsights, void>({
      query: () => "/ai/insights",
      providesTags: ["AIInsights"],
    }),

    // Get analysis for a specific debtor
    getDebtorAnalysis: builder.query<DebtorAnalysis, string>({
      query: (debtorId: string) => `/ai/debtor/${debtorId}/analysis`,
      providesTags: ["DebtorAnalysis"],
    }),

    // Get payment predictions
    getPaymentPredictions: builder.query<PaymentPredictions, void>({
      query: () => "/ai/predictions",
      providesTags: ["Predictions"],
    }),

    // Get risk assessment
    getRiskAssessment: builder.query<RiskAssessment, void>({
      query: () => "/ai/risk-assessment",
      providesTags: ["RiskAssessment"],
    }),

    // Get comprehensive analysis (all insights combined)
    getComprehensiveAnalysis: builder.query<ComprehensiveAnalysis, void>({
      query: () => "/ai/comprehensive",
      providesTags: ["AIInsights", "Predictions", "RiskAssessment"],
    }),
  }),
});

export const {
  useGetUserInsightsQuery,
  useGetDebtorAnalysisQuery,
  useGetPaymentPredictionsQuery,
  useGetRiskAssessmentQuery,
  useGetComprehensiveAnalysisQuery,
} = aiApi;

// Types for AI responses
export interface DebtorAnalysis {
  debtorId: number;
  name: string;
  amountOwed: number;
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  paymentLikelihood: number;
  recommendedActions: string[];
  nextPaymentPrediction?: {
    date: string;
    amount: number;
    confidence: number;
  };
}

export interface UserInsights {
  totalDebtors: number;
  totalAmountOwed: number;
  averageDebtPerDebtor: number;
  highRiskDebtors: number;
  paymentTrends: string;
  recommendations: string[];
  cashFlowPrediction: {
    nextMonth: number;
    nextThreeMonths: number;
    confidence: "low" | "medium" | "high";
  };
}

export interface PaymentPrediction {
  debtorId: number;
  debtorName: string;
  nextPaymentDate: string;
  predictedAmount: number;
  confidence: number;
  reasoning: string;
}

export interface PaymentPredictions {
  predictions: PaymentPrediction[];
  totalExpectedPayments: number;
  timeframe: string;
}

export interface RiskAssessment {
  overallRiskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  debtorRiskBreakdown: Array<{
    debtorId: number;
    name: string;
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    riskFactors: string[];
  }>;
  recommendations: string[];
}

export interface ComprehensiveAnalysis {
  insights: UserInsights;
  predictions: PaymentPredictions;
  riskAssessment: RiskAssessment;
  generatedAt: string;
}
