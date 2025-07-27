import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { Card } from "@/Shared/Components/UIKitten/Card";
import { useGetAIInsightsQuery } from "./AIApi";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { ErrorView } from "@/Shared/Components/ErrorView";

interface AIInsightsCardProps {
  onRecommendationPress?: (debtorId: number) => void;
  compact?: boolean;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  onRecommendationPress,
  compact = false,
}) => {
  const { data, isLoading, error, refetch } = useGetAIInsightsQuery();

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <LoadingView text="Loading AI insights..." />
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Card style={styles.card}>
        <ErrorView
          error="AI insights unavailable"
          onRetry={refetch}
          compact={true}
        />
      </Card>
    );
  }

  const insights = data.data;
  const highRiskDebtors = insights.risk_assessments.filter(
    (assessment) => assessment.risk_level === "high"
  ).length;

  const totalExpected = insights.cash_flow_prediction.total_expected;
  const topRecommendations = insights.recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, compact ? 2 : 3);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#FFB347";
      case "low":
        return "#51CF66";
      default:
        return Colors.text;
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "high":
        return "warning";
      case "medium":
        return "alert-circle";
      case "low":
        return "checkmark-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="analytics" size={24} color={Colors.primary} />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <Text style={styles.subtitle}>Smart debt analysis</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Risk Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Overview</Text>
          <View style={styles.riskContainer}>
            <View style={styles.riskItem}>
              <Text style={styles.riskNumber}>{highRiskDebtors}</Text>
              <Text style={styles.riskLabel}>High Risk</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={[styles.riskNumber, { color: Colors.primary }]}>
                {insights.risk_assessments.length - highRiskDebtors}
              </Text>
              <Text style={styles.riskLabel}>Low/Medium Risk</Text>
            </View>
          </View>
        </View>

        {/* Cash Flow Prediction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expected Collections</Text>
          <View style={styles.cashFlowContainer}>
            <Text style={styles.cashFlowAmount}>
              GHS{" "}
              {totalExpected.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.cashFlowSubtext}>
              Next 3 months (estimated)
            </Text>
          </View>
        </View>

        {/* Top Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Recommendations</Text>
          {topRecommendations.length > 0 ? (
            topRecommendations.map((recommendation, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recommendationItem}
                onPress={() =>
                  onRecommendationPress?.(recommendation.debtor_id)
                }
              >
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationHeader}>
                    <Ionicons
                      name={
                        recommendation.priority >= 4
                          ? "alert-circle"
                          : recommendation.priority >= 3
                          ? "information-circle"
                          : "checkmark-circle"
                      }
                      size={16}
                      color={
                        recommendation.priority >= 4
                          ? "#FF6B6B"
                          : recommendation.priority >= 3
                          ? "#FFB347"
                          : "#51CF66"
                      }
                    />
                    <Text style={styles.recommendationType}>
                      {recommendation.recommendation_type
                        .replace(/_/g, " ")
                        .toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.recommendationMessage}>
                    {recommendation.message}
                  </Text>
                  <Text style={styles.recommendationAction}>
                    {recommendation.suggested_action}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No recommendations available</Text>
          )}
        </View>

        {/* Payment Predictions Summary */}
        {!compact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Likelihood</Text>
            <View style={styles.predictionsSummary}>
              {insights.payment_predictions
                .slice(0, 3)
                .map((prediction, index) => (
                  <View
                    key={prediction.debtor_id}
                    style={styles.predictionItem}
                  >
                    <View style={styles.predictionBar}>
                      <View
                        style={[
                          styles.predictionFill,
                          {
                            width: `${prediction.likelihood_of_payment * 100}%`,
                            backgroundColor:
                              prediction.likelihood_of_payment > 0.7
                                ? "#51CF66"
                                : prediction.likelihood_of_payment > 0.4
                                ? "#FFB347"
                                : "#FF6B6B",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.predictionPercentage}>
                      {Math.round(prediction.likelihood_of_payment * 100)}%
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 32,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  riskContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  riskItem: {
    alignItems: "center",
  },
  riskNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  riskLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cashFlowContainer: {
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
  },
  cashFlowAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  cashFlowSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  recommendationType: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  recommendationMessage: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  recommendationAction: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: "italic",
  },
  predictionsSummary: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  predictionBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 8,
  },
  predictionFill: {
    height: "100%",
    borderRadius: 4,
  },
  predictionPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    minWidth: 35,
    textAlign: "right",
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
});
