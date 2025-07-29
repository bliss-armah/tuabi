import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Card } from "../../Shared/Components/UIKitten/Card";
import { Colors } from "../../Shared/Constants/Colors";
import { useGetUserInsightsQuery } from "./AIApi";
import { LoadingView } from "../../Shared/Components/LoadingView";
import { ErrorView } from "../../Shared/Components/ErrorView";

interface AIInsightsCardProps {
  compact?: boolean;
  onRecommendationPress?: (debtorId: number) => void;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  compact = false,
  onRecommendationPress,
}) => {
  const {
    data: insights,
    isLoading,
    error,
    refetch,
  } = useGetUserInsightsQuery();

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <LoadingView text="Analyzing your debt portfolio..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.card}>
        <ErrorView error="Unable to load AI insights" onRetry={refetch} />
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return Colors.success;
      case "medium":
        return Colors.warning;
      case "high":
        return Colors.danger;
      default:
        return Colors.text;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return Colors.success;
      case "medium":
        return Colors.warning;
      case "low":
        return Colors.danger;
      default:
        return Colors.text;
    }
  };

  if (compact) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>
            🤖 AI Insights
          </Text>
        </View>

        <View style={styles.compactContent}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              High Risk Debtors:
            </Text>
            <Text style={[styles.statValue, { color: getRiskColor("high") }]}>
              {insights.highRiskDebtors}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              Next Month Cash Flow:
            </Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: getConfidenceColor(
                    insights.cashFlowPrediction.confidence
                  ),
                },
              ]}
            >
              ${insights.cashFlowPrediction.nextMonth.toLocaleString()}
            </Text>
          </View>

          {insights.recommendations.length > 0 && (
            <TouchableOpacity
              style={styles.recommendationButton}
              onPress={() =>
                Alert.alert("AI Recommendations", insights.recommendations[0])
              }
            >
              <Text
                style={[styles.recommendationText, { color: Colors.primary }]}
              >
                💡 {insights.recommendations[0]}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>
          🤖 AI Portfolio Analysis
        </Text>
      </View>

      <View style={styles.content}>
        {/* Portfolio Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Portfolio Overview
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {insights.totalDebtors}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
                Total Debtors
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[styles.statNumber, { color: getRiskColor("high") }]}
              >
                {insights.highRiskDebtors}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
                High Risk
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                ${insights.averageDebtPerDebtor.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
                Avg Debt
              </Text>
            </View>
          </View>
        </View>

        {/* Cash Flow Prediction */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Cash Flow Prediction
          </Text>
          <View style={styles.cashFlowRow}>
            <View style={styles.cashFlowItem}>
              <Text
                style={[styles.cashFlowLabel, { color: Colors.textSecondary }]}
              >
                Next Month
              </Text>
              <Text
                style={[
                  styles.cashFlowAmount,
                  {
                    color: getConfidenceColor(
                      insights.cashFlowPrediction.confidence
                    ),
                  },
                ]}
              >
                ${insights.cashFlowPrediction.nextMonth.toLocaleString()}
              </Text>
            </View>
            <View style={styles.cashFlowItem}>
              <Text
                style={[styles.cashFlowLabel, { color: Colors.textSecondary }]}
              >
                Next 3 Months
              </Text>
              <Text
                style={[
                  styles.cashFlowAmount,
                  {
                    color: getConfidenceColor(
                      insights.cashFlowPrediction.confidence
                    ),
                  },
                ]}
              >
                ${insights.cashFlowPrediction.nextThreeMonths.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Trends */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Payment Trends
          </Text>
          <Text style={[styles.trendText, { color: Colors.textSecondary }]}>
            {insights.paymentTrends}
          </Text>
        </View>

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              AI Recommendations
            </Text>
            {insights.recommendations.map(
              (recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text
                    style={[
                      styles.recommendationText,
                      { color: Colors.primary },
                    ]}
                  >
                    💡 {recommendation}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  compactContent: {
    gap: 8,
  },
  content: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  cashFlowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cashFlowItem: {
    flex: 1,
    alignItems: "center",
  },
  cashFlowLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  cashFlowAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  trendText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationButton: {
    paddingVertical: 8,
  },
});
