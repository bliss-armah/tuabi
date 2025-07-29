import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetRiskAssessmentQuery } from "./AIApi";

interface DebtorRiskBadgeProps {
  debtorId: number;
  showText?: boolean;
  size?: "small" | "medium";
}

export const DebtorRiskBadge: React.FC<DebtorRiskBadgeProps> = ({
  debtorId,
  showText = true,
  size = "small",
}) => {
  const { data, isLoading, error } = useGetRiskAssessmentQuery({ debtorId });

  if (isLoading || error || !data?.success) {
    return null; // Don't show anything if loading or error
  }

  const assessment = data.data.find((a) => a.debtor_id === debtorId);
  if (!assessment) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#FFB347";
      case "low":
        return "#51CF66";
      default:
        return "#CCCCCC";
    }
  };

  const getRiskIcon = (level: string) => {
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

  const iconSize = size === "small" ? 12 : 16;
  const fontSize = size === "small" ? 10 : 12;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getRiskColor(assessment.risk_level) + "20" },
      ]}
    >
      <Ionicons
        name={getRiskIcon(assessment.risk_level)}
        size={iconSize}
        color={getRiskColor(assessment.risk_level)}
      />
      {showText && (
        <Text
          style={[
            styles.text,
            { color: getRiskColor(assessment.risk_level), fontSize },
          ]}
        >
          {assessment.risk_level.toUpperCase()} RISK
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
    marginLeft: 4,
  },
});
