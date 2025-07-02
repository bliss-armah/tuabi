import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { useGetDashboardSummaryQuery } from "@/Features/Debtors/DebtorsApi";
import { useAuth } from "@/Shared/Hooks/useAuth";
import SubscriptionStatus from "@/Features/Subscription/SubscriptionStatus";

export default function Home() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();

  const { user, loading } = useAuth();

  if (loading || isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[theme].primary} />
        <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <Text style={[styles.errorText, { color: Colors[theme].accent }]}>
          {error &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data &&
          "message" in error.data
            ? (error.data as any).message
            : "An error occurred"}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={refetch}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <View style={[styles.header, { backgroundColor: Colors[theme].primary }]}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Overview of your store's debt records
        </Text>
      </View>

      {/* Subscription Status */}
      <SubscriptionStatus showUpgradeButton={true} compact={false} />

      <View style={styles.statsContainer}>
        <View
          style={[styles.statCard, { backgroundColor: Colors[theme].card }]}
        >
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: `${Colors[theme].primary}20`,
              },
            ]}
          >
            <Ionicons name="people" size={24} color={Colors[theme].primary} />
          </View>
          <Text style={[styles.statValue, { color: Colors[theme].text }]}>
            {data?.data?.summary?.totalDebtors || 0}
          </Text>
          <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>
            Total Debtors
          </Text>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: Colors[theme].card }]}
        >
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: `${Colors[theme].secondary}20`,
              },
            ]}
          >
            <Ionicons name="cash" size={24} color={Colors[theme].secondary} />
          </View>
          <Text style={[styles.statValue, { color: Colors[theme].text }]}>
            ${(data?.data?.summary?.totalAmountOwed || 0).toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>
            Total Amount Owed
          </Text>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: Colors[theme].card }]}
        >
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: `${Colors[theme].accent}20`,
              },
            ]}
          >
            <Ionicons name="time" size={24} color={Colors[theme].accent} />
          </View>
          <Text style={[styles.statValue, { color: Colors[theme].text }]}>
            {data?.data?.recentActivities?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>
            Recent Activities
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={() => router.push("/debtors" as any)}
        >
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>View All Debtors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: Colors[theme].secondary },
          ]}
          onPress={() => router.push("/add-debtor" as any)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Add New Debtor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={[styles.tipsTitle, { color: Colors[theme].text }]}>
          Tips for Managing Debtors
        </Text>
        <View style={[styles.tipCard, { backgroundColor: Colors[theme].card }]}>
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors[theme].primary}
          />
          <Text style={[styles.tipText, { color: Colors[theme].text }]}>
            Regularly update payment records to keep track of all transactions.
          </Text>
        </View>
        <View style={[styles.tipCard, { backgroundColor: Colors[theme].card }]}>
          <Ionicons name="call" size={20} color={Colors[theme].primary} />
          <Text style={[styles.tipText, { color: Colors[theme].text }]}>
            Use the call feature to quickly contact debtors about payments.
          </Text>
        </View>
        <View style={[styles.tipCard, { backgroundColor: Colors[theme].card }]}>
          <Ionicons
            name="notifications"
            size={20}
            color={Colors[theme].primary}
          />
          <Text style={[styles.tipText, { color: Colors[theme].text }]}>
            Set reminders for follow-ups with customers who have outstanding
            debts.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 15,
  },
  statCard: {
    borderRadius: 16,
    padding: 15,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  actionsContainer: {
    padding: 15,
    marginTop: 15,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
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
