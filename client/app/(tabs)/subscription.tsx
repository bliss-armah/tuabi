import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import SubscriptionStatus from "@/Features/Subscription/SubscriptionStatus";
import {
  useGetUserTransactionsQuery,
  useGetUserSubscriptionsQuery,
} from "@/Features/Subscription/SubscriptionAPI";
import { router } from "expo-router";

export default function SubscriptionScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const { data: transactions, isLoading: transactionsLoading } =
    useGetUserTransactionsQuery();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useGetUserSubscriptionsQuery();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return Colors.primary;
      case "pending":
        return Colors.accent;
      case "failed":
        return Colors.accent;
      default:
        return Colors.icon;
    }
  };

  const handleViewAllTransactions = () => {
    // You can create a separate transactions screen if needed
    Alert.alert("Transactions", "View all transactions feature coming soon!");
  };

  const handleViewAllSubscriptions = () => {
    // You can create a separate subscriptions screen if needed
    Alert.alert("Subscriptions", "View all subscriptions feature coming soon!");
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Subscription</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/subscription-plans")}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subscription Status */}
        <SubscriptionStatus showUpgradeButton={true} />

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              Recent Transactions
            </Text>
            {transactions && transactions.length > 3 && (
              <TouchableOpacity onPress={handleViewAllTransactions}>
                <Text style={[styles.viewAllText, { color: Colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {transactionsLoading ? (
            <Text style={[styles.loadingText, { color: Colors.text }]}>
              Loading transactions...
            </Text>
          ) : transactions && transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 3).map((transaction) => (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionItem,
                    { borderBottomColor: Colors.border },
                  ]}
                >
                  <View style={styles.transactionInfo}>
                    <Text
                      style={[styles.transactionAmount, { color: Colors.text }]}
                    >
                      {formatAmount(transaction.amount)}
                    </Text>
                    <Text
                      style={[styles.transactionDate, { color: Colors.text }]}
                    >
                      {formatDate(transaction.created_at)}
                    </Text>
                    {transaction.description && (
                      <Text
                        style={[
                          styles.transactionDescription,
                          { color: Colors.text },
                        ]}
                      >
                        {transaction.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.transactionStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(transaction.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(transaction.status) },
                      ]}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: Colors.text }]}>
              No transactions found
            </Text>
          )}
        </View>

        {/* Subscription History */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              Subscription History
            </Text>
            {subscriptions && subscriptions.length > 3 && (
              <TouchableOpacity onPress={handleViewAllSubscriptions}>
                <Text style={[styles.viewAllText, { color: Colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {subscriptionsLoading ? (
            <Text style={[styles.loadingText, { color: Colors.text }]}>
              Loading subscriptions...
            </Text>
          ) : subscriptions && subscriptions.length > 0 ? (
            <View style={styles.subscriptionsList}>
              {subscriptions.slice(0, 3).map((subscription) => (
                <View
                  key={subscription.id}
                  style={[
                    styles.subscriptionItem,
                    { borderBottomColor: Colors.border },
                  ]}
                >
                  <View style={styles.subscriptionInfo}>
                    <Text
                      style={[styles.subscriptionPlan, { color: Colors.text }]}
                    >
                      {subscription.plan_type.charAt(0).toUpperCase() +
                        subscription.plan_type.slice(1)}{" "}
                      Plan
                    </Text>
                    <Text
                      style={[
                        styles.subscriptionAmount,
                        { color: Colors.primary },
                      ]}
                    >
                      {formatAmount(subscription.amount)}
                    </Text>
                    <Text
                      style={[styles.subscriptionDate, { color: Colors.text }]}
                    >
                      {formatDate(subscription.start_date)} -{" "}
                      {formatDate(subscription.end_date)}
                    </Text>
                  </View>
                  <View style={styles.subscriptionStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            subscription.status === "active"
                              ? Colors.primary
                              : Colors.accent,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            subscription.status === "active"
                              ? Colors.primary
                              : Colors.accent,
                        },
                      ]}
                    >
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: Colors.text }]}>
              No subscription history found
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => router.push("/subscription-plans")}
            >
              <Ionicons name="card-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors.secondary },
              ]}
              onPress={() =>
                Alert.alert("Support", "Contact support feature coming soon!")
              }
            >
              <Ionicons name="help-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  transactionsList: {
    gap: 15,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  subscriptionsList: {
    gap: 15,
  },
  subscriptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subscriptionAmount: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subscriptionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  subscriptionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickActions: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
