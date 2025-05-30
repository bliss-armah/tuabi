import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useColorScheme as _useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { debtorService } from "../../Shared/Api/api";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";

type DashboardData = {
  totalDebtors: number;
  totalDebt: number;
  recentActivities: number;
};

export default function Home() {
  const colorScheme = useColorScheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await debtorService.getDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].primary}
        />
        <Text
          style={[
            styles.loadingText,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: Colors[colorScheme ?? "light"].primary },
          ]}
          onPress={loadDashboardData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme ?? "light"].primary },
        ]}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Overview of your store's debt records
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: `${Colors[colorScheme ?? "light"].primary}20`,
              },
            ]}
          >
            <Ionicons
              name="people"
              size={24}
              color={Colors[colorScheme ?? "light"].primary}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            {dashboardData?.totalDebtors || 0}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: Colors[colorScheme ?? "light"].icon },
            ]}
          >
            Total Debtors
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: `${
                  Colors[colorScheme ?? "light"].secondary
                }20`,
              },
            ]}
          >
            <Ionicons
              name="cash"
              size={24}
              color={Colors[colorScheme ?? "light"].secondary}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            ${(dashboardData?.totalDebt || 0).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: Colors[colorScheme ?? "light"].icon },
            ]}
          >
            Total Amount Owed
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: `${Colors[colorScheme ?? "light"].accent}20` },
            ]}
          >
            <Ionicons
              name="time"
              size={24}
              color={Colors[colorScheme ?? "light"].accent}
            />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            {dashboardData?.recentActivities || 0}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: Colors[colorScheme ?? "light"].icon },
            ]}
          >
            Recent Activities
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: Colors[colorScheme ?? "light"].primary },
          ]}
          onPress={() => router.push("/debtors" as any)}
        >
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>View All Debtors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: Colors[colorScheme ?? "light"].secondary },
          ]}
          onPress={() => router.push("/add-debtor" as any)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Add New Debtor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text
          style={[
            styles.tipsTitle,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          Tips for Managing Debtors
        </Text>
        <View
          style={[
            styles.tipCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors[colorScheme ?? "light"].primary}
          />
          <Text
            style={[
              styles.tipText,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            Regularly update payment records to keep track of all transactions.
          </Text>
        </View>
        <View
          style={[
            styles.tipCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <Ionicons
            name="call"
            size={20}
            color={Colors[colorScheme ?? "light"].primary}
          />
          <Text
            style={[
              styles.tipText,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            Use the call feature to quickly contact debtors about payments.
          </Text>
        </View>
        <View
          style={[
            styles.tipCard,
            { backgroundColor: Colors[colorScheme ?? "light"].card },
          ]}
        >
          <Ionicons
            name="notifications"
            size={20}
            color={Colors[colorScheme ?? "light"].primary}
          />
          <Text
            style={[
              styles.tipText,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
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
    color: "#e74c3c",
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
