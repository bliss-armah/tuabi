import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useGetUserSubscriptionStatusQuery,
  UserSubscriptionStatus,
} from "@/Features/Subscription/SubscriptionAPI";

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export default function SubscriptionStatus({
  showUpgradeButton = true,
  compact = false,
}: SubscriptionStatusProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const {
    data: subscriptionStatus,
    isLoading,
    error,
  } = useGetUserSubscriptionStatusQuery();

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
      <View style={[styles.container, { backgroundColor: Colors[theme].card }]}>
        <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
          Loading subscription status...
        </Text>
      </View>
    );
  }

  if (error || !subscriptionStatus) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].card }]}>
        <Text style={[styles.errorText, { color: Colors[theme].error }]}>
          Failed to load subscription status
        </Text>
      </View>
    );
  }

  const isSubscribed = subscriptionStatus.is_subscribed;
  const hasExpired =
    subscriptionStatus.subscription_expires_at &&
    new Date(subscriptionStatus.subscription_expires_at) < new Date();

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: Colors[theme].card },
        ]}
      >
        {isSubscribed && !hasExpired ? (
          <View style={styles.compactActive}>
            <View style={[styles.statusDot, { backgroundColor: "#27ae60" }]} />
            <Text style={[styles.compactText, { color: Colors[theme].text }]}>
              Active
            </Text>
          </View>
        ) : (
          <View style={styles.compactInactive}>
            <View style={[styles.statusDot, { backgroundColor: "#e74c3c" }]} />
            <Text style={[styles.compactText, { color: Colors[theme].text }]}>
              {hasExpired ? "Expired" : "No Subscription"}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Subscription Status
        </Text>
        {isSubscribed && !hasExpired && (
          <View style={[styles.statusBadge, { backgroundColor: "#27ae60" }]}>
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
        )}
      </View>

      {isSubscribed && !hasExpired ? (
        <View style={styles.activeSubscription}>
          <Text style={[styles.statusText, { color: Colors[theme].text }]}>
            Your subscription is active
          </Text>

          {subscriptionStatus.current_plan && (
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: Colors[theme].text }]}>
                {subscriptionStatus.current_plan.plan_type
                  .charAt(0)
                  .toUpperCase() +
                  subscriptionStatus.current_plan.plan_type.slice(1)}{" "}
                Plan
              </Text>
              <Text
                style={[styles.planAmount, { color: Colors[theme].primary }]}
              >
                ₦{subscriptionStatus.current_plan.amount.toLocaleString()}
              </Text>
            </View>
          )}

          {subscriptionStatus.subscription_expires_at && (
            <View style={styles.expiryInfo}>
              <Text style={[styles.expiryLabel, { color: Colors[theme].text }]}>
                Expires on:
              </Text>
              <Text style={[styles.expiryDate, { color: Colors[theme].text }]}>
                {formatDate(subscriptionStatus.subscription_expires_at)}
              </Text>
              <Text
                style={[styles.daysRemaining, { color: Colors[theme].primary }]}
              >
                {getDaysRemaining(subscriptionStatus.subscription_expires_at)}{" "}
                days remaining
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.inactiveSubscription}>
          <Text style={[styles.statusText, { color: Colors[theme].text }]}>
            {hasExpired
              ? "Your subscription has expired"
              : "No active subscription"}
          </Text>

          {hasExpired && subscriptionStatus.subscription_expires_at && (
            <Text style={[styles.expiredDate, { color: Colors[theme].error }]}>
              Expired on{" "}
              {formatDate(subscriptionStatus.subscription_expires_at)}
            </Text>
          )}

          <Text style={[styles.upgradeText, { color: Colors[theme].text }]}>
            Upgrade to access all features and unlimited debtors
          </Text>

          {showUpgradeButton && (
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: Colors[theme].primary },
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

      {subscriptionStatus.active_transactions.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text
            style={[styles.transactionsTitle, { color: Colors[theme].text }]}
          >
            Recent Transactions
          </Text>
          {subscriptionStatus.active_transactions
            .slice(0, 3)
            .map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: Colors[theme].text },
                  ]}
                >
                  ₦{transaction.amount.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.transactionStatus,
                    {
                      color:
                        transaction.status === "success"
                          ? "#27ae60"
                          : "#f39c12",
                    },
                  ]}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            ))}
        </View>
      )}
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
    alignItems: "center",
  },
  planName: {
    fontSize: 14,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expiryInfo: {
    gap: 5,
  },
  expiryLabel: {
    fontSize: 14,
  },
  expiryDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  daysRemaining: {
    fontSize: 14,
    fontWeight: "500",
  },
  expiredDate: {
    fontSize: 14,
    fontWeight: "500",
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
  transactionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
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
    paddingVertical: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionStatus: {
    fontSize: 12,
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
  },
});
