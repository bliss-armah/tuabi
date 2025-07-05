import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { useGetDashboardSummaryQuery } from "@/Features/Debtors/DebtorsApi";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { useDebtorModal } from "@/Shared/Hooks/useDebtorModal";
import DebtorModal from "@/Features/Debtors/DebtorModal";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { ErrorView } from "@/Shared/Components/ErrorView";
import DashboardSummaryCard from "@/Features/Debtors/DashboardSummaryCard";
import { Navbar } from "@/Shared/Components/Navbar";
// import SubscriptionStatus from "@/Features/Subscription/SubscriptionStatus";

export default function Home() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();
  const { closeModal, openAddDebtor, mode, isVisible } = useDebtorModal();

  const { user, loading } = useAuth();

  if (loading || isLoading) {
    return <LoadingView text=" Loading dashboard..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (error) {
    return (
      <ErrorView
        error={(error as any)?.data?.message || "Something went wrong"}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ScrollView
        style={[styles.container, { backgroundColor: Colors.background }]}
      >
        <Text style={styles.headerTitle}>Debt Overview 📊</Text>

        {/* Subscription Status */}
        {/* <SubscriptionStatus showUpgradeButton={true} compact={false} /> */}

        <DashboardSummaryCard
          debtors={data?.data?.summary?.totalDebtors || 0}
          amount={data?.data?.summary?.totalAmountOwed || 0}
        />

        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: Colors.text }]}>
            Tips for Managing Debtors
          </Text>
          <View style={[styles.tipCard, { backgroundColor: Colors.card }]}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.primary}
            />
            <Text style={[styles.tipText, { color: Colors.text }]}>
              Regularly update payment records to keep track of all
              transactions.
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: Colors.card }]}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={[styles.tipText, { color: Colors.text }]}>
              Use the call feature to quickly contact debtors about payments.
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: Colors.card }]}>
            <Ionicons name="notifications" size={20} color={Colors.primary} />
            <Text style={[styles.tipText, { color: Colors.text }]}>
              Set reminders for follow-ups with customers who have outstanding
              debts.
            </Text>
          </View>
        </View>
      </ScrollView>
      <DebtorModal
        visible={isVisible}
        mode={mode}
        onClose={closeModal}
        onSuccess={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a0a0a",
    marginTop: 5,
  },
  tipsContainer: {
    padding: 15,
    marginTop: 15,
    marginBottom: 25,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
