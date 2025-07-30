import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/Shared/Constants/Colors";
import {
  useGetUserSubscriptionStatusQuery,
  Transaction,
} from "@/Features/Subscription/SubscriptionAPI";

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export default function SubscriptionStatus({
  showUpgradeButton = true,
  compact = false,
}: SubscriptionStatusProps) {
  const {
    data: subscriptionResponse,
    isLoading,
    error,
    refetch,
  } = useGetUserSubscriptionStatusQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const handleUpgrade = () => {
    router.push("/subscription-plans");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.card }]}>
        <Text style={[styles.loadingText, { color: Colors.text }]}>
          Loading subscription status...
        </Text>
      </View>
    );
  }

  if (error || !subscriptionResponse?.status) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.card }]}>
        <Text style={[styles.errorText, { color: Colors.text }]}>
          Failed to load subscription status
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract the actual subscription data
  const subscriptionData = subscriptionResponse?.data;
  const isSubscribed = subscriptionData?.is_subscribed || false;
  const currentPlan = subscriptionData?.current_plan;
  const expirationDate = subscriptionData?.subscription_expires_at;
  const activeTransactions = subscriptionData?.active_transactions || [];

  // Check if subscription has expired
  const hasExpired = expirationDate && new Date(expirationDate) < new Date();

  // Determine actual subscription status
  const isActiveSubscription =
    isSubscribed && !hasExpired && currentPlan?.status === "active";

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: Colors.card }]}>
        {isActiveSubscription ? (
          <View style={styles.compactActive}>
            <View
              style={[styles.statusDot, { backgroundColor: Colors.primary }]}
            />
            <Text style={[styles.compactText, { color: Colors.text }]}>
              Active - {currentPlan?.plan?.name || "Unknown Plan"}
            </Text>
          </View>
        ) : (
          <View style={styles.compactInactive}>
            <View
              style={[styles.statusDot, { backgroundColor: Colors.text }]}
            />
            <Text style={[styles.compactText, { color: Colors.text }]}>
              {hasExpired ? "Expired" : "No Active Subscription"}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>
          Subscription Status
        </Text>
        {isActiveSubscription && (
          <View
            style={[styles.statusBadge, { backgroundColor: Colors.primary }]}
          >
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
        )}
        {hasExpired && (
          <View style={[styles.statusBadge, { backgroundColor: Colors.text }]}>
            <Text style={styles.statusBadgeText}>Expired</Text>
          </View>
        )}
      </View>

      {isActiveSubscription ? (
        <View style={styles.activeSubscription}>
          {currentPlan && (
            <View style={styles.planInfo}>
              <View>
                <Text style={[styles.planName, { color: Colors.text }]}>
                  {currentPlan?.plan?.name} Plan
                </Text>
              </View>
              <Text style={[styles.planAmount, { color: Colors.text }]}>
                ₵{currentPlan?.plan?.amount.toLocaleString()}
              </Text>
            </View>
          )}

          {expirationDate && (
            <View style={styles.expiryInfo}>
              <Text style={[styles.expiryLabel, { color: Colors.text }]}>
                Subscription Period:
              </Text>
              <Text style={[styles.expiryDate, { color: Colors.text }]}>
                {formatDate(currentPlan?.startDate || "")} -{" "}
                {formatDate(expirationDate)}
              </Text>
              <Text style={[styles.daysRemaining, { color: Colors.text }]}>
                {getDaysRemaining(expirationDate)} days remaining
              </Text>
            </View>
          )}

          {currentPlan?.paystackCustomerId && (
            <View style={styles.customerInfo}>
              <Text style={[styles.customerLabel, { color: Colors.text }]}>
                Customer ID: {currentPlan.paystackCustomerId}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.inactiveSubscription}>
          <Text style={[styles.statusText, { color: Colors.text }]}>
            {hasExpired
              ? "Your subscription has expired"
              : "No active subscription"}
          </Text>

          {hasExpired && expirationDate && (
            <Text style={[styles.expiredDate, { color: Colors.text }]}>
              Expired on {formatDate(expirationDate)}
            </Text>
          )}

          {currentPlan && hasExpired && (
            <Text style={[styles.expiredPlan, { color: Colors.text }]}>
              Previous plan: {currentPlan?.plan?.name}
            </Text>
          )}

          <Text style={[styles.upgradeText, { color: Colors.text }]}>
            {hasExpired
              ? "Renew your subscription to continue accessing all features"
              : "Upgrade to access all features and unlimited debtors"}
          </Text>

          {showUpgradeButton && (
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: Colors.text },
              ]}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>
                {hasExpired ? "Renew Subscription" : "Upgrade Now"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* {activeTransactions.length > 0 && (
        <View
          style={[
            styles.transactionsSection,
            { borderTopColor: Colors.border },
          ]}
        >
          <Text style={[styles.transactionsTitle, { color: Colors.text }]}>
            Recent Transactions ({activeTransactions.length})
          </Text>
          {activeTransactions.slice(0, 3).map((transaction: Transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View>
                <Text
                  style={[styles.transactionAmount, { color: Colors.text }]}
                >
                  ₵{transaction.amount.toLocaleString()}
                </Text>
                {transaction.createdAt && (
                  <Text
                    style={[styles.transactionDate, { color: Colors.text }]}
                  >
                    {formatDate(transaction.createdAt)}
                  </Text>
                )}
              </View>
              <View style={styles.transactionStatus}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor:
                        transaction.status === "success"
                          ? Colors.primary
                          : transaction.status === "pending"
                          ? "#FFA500"
                          : Colors.text,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.transactionStatusText,
                    {
                      color:
                        transaction.status === "success"
                          ? Colors.primary
                          : transaction.status === "pending"
                          ? "#FFA500"
                          : Colors.text,
                    },
                  ]}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            </View>
          ))}

          {activeTransactions.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllTransactions}
              onPress={() => {
                // Navigate to full transactions view or show alert
                Alert.alert(
                  "Transactions",
                  "View all transactions feature coming soon!"
                );
              }}
            >
              <Text style={[styles.viewAllText, { color: Colors.primary }]}>
                View all {activeTransactions.length} transactions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeSubscription: {
    gap: 15,
  },
  inactiveSubscription: {
    gap: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  planInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
  },
  planDescription: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  planAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  expiryInfo: {
    gap: 5,
  },
  expiryLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  expiryDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  daysRemaining: {
    fontSize: 14,
    fontWeight: "500",
  },
  customerInfo: {
    paddingTop: 5,
  },
  customerLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  expiredDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  expiredPlan: {
    fontSize: 14,
    opacity: 0.7,
  },
  upgradeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  transactionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 6,
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  transactionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewAllTransactions: {
    paddingVertical: 8,
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  compactActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactInactive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
});
