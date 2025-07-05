import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { formatCurrency } from "@/Shared/utils/utils";
import { router } from "expo-router";

type Props = {
  debtors: number;
  amount: number;
};

export default function DashboardSummaryCard({ debtors, amount }: Props) {
  const theme = useColorScheme() ?? "light";

  const handleDebtorsNavigation = () => {
    router.push("/debtors");
  };

  return (
    <TouchableOpacity onPress={handleDebtorsNavigation} activeOpacity={0.85}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: Colors.offwhite }]}>
              Total Debtors
            </Text>
            <Text style={[styles.value, { color: Colors.background }]}>
              {debtors || 0}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.label, { color: Colors.offwhite }]}>
              Amount Owed
            </Text>
            <Text style={[styles.value, { color: Colors.background }]}>
              {formatCurrency(amount || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="trending-up" size={16} color={Colors.background} />
          <Text style={[styles.footerText, { color: Colors.offwhite }]}>
            Keep tracking repayments consistently
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 12,
  },
});
