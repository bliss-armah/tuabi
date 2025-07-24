import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useGetSubscriptionPlansQuery,
  useInitializeSubscriptionPaymentMutation,
  useVerifySubscriptionPaymentMutation,
  SubscriptionPlan,
} from "@/Features/Subscription/SubscriptionAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { usePaystack } from "react-native-paystack-webview";
import { Button } from "@/Shared/Components/UIKitten";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { useGetUserSubscriptionStatusQuery } from "@/Features/Subscription/SubscriptionAPI";

export default function SubscriptionPlansScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifySubscriptionPaymentMutation();
  const { user } = useAuth();
  const { data: plans, isLoading, error } = useGetSubscriptionPlansQuery();
  const [initializePayment, { isLoading: isInitializing }] =
    useInitializeSubscriptionPaymentMutation();
  const [polling, setPolling] = useState(false);

  const { popup } = usePaystack();

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a plan first");
      return;
    }

    try {
      if (!user || !user.email) {
        Alert.alert("Error", "User information not found");
        return;
      }

      // Initialize payment to get authorization_url
      const response = await initializePayment({
        email: user.email,
        amount: selectedPlan.amount,
        planId: selectedPlan.id.toString(),
        currency: "GHS",
      }).unwrap();

      if (response.status && response.data.authorization_url) {
        // Open the Paystack payment page in browser
        Linking.openURL(response.data.authorization_url);
        // Start polling for subscription status
        setPolling(true);
        pollSubscriptionStatus();
      } else {
        Alert.alert("Error", "Failed to initialize payment");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process payment");
    }
  };

  // Polling function for subscription status
  const { refetch: refetchStatus } = useGetUserSubscriptionStatusQuery(
    undefined,
    { skip: true }
  );
  const pollSubscriptionStatus = async () => {
    let attempts = 0;
    const maxAttempts = 20; // e.g., poll for up to 2 minutes
    const delay = 6000; // 6 seconds
    while (attempts < maxAttempts) {
      const { data } = await refetchStatus();
      if (data?.data?.is_subscribed) {
        setPolling(false);
        Alert.alert(
          "Payment Successful",
          "Your subscription has been activated!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }
    setPolling(false);
    Alert.alert(
      "Verification Timeout",
      "We could not verify your payment in time. Please check your subscription status later."
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {/* Spinner overlay for verifying payment or polling */}
      {(isVerifying || polling) && (
        <View style={styles.verifyingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.verifyingText, { color: Colors.text }]}>
            Verifying payment...
          </Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: Colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>
          Choose Your Plan
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: Colors.text }]}>
          Select a subscription plan to unlock all features
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: Colors.text }]}>
              Loading plans...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Colors.accent }]}>
              Failed to load subscription plans
            </Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {plans?.data.map((plan: any) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: Colors.card,
                    borderColor:
                      selectedPlan?.id === plan.id
                        ? Colors.primary
                        : Colors.border,
                  },
                ]}
                onPress={() => handlePlanSelection(plan)}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: Colors.text }]}>
                    {plan.name}
                  </Text>
                  {plan.name.toLowerCase() === "yearly" && (
                    <View
                      style={[
                        styles.savingsBadge,
                        { backgroundColor: Colors.primary },
                      ]}
                    >
                      <Text style={styles.savingsText}>Save 20%</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.planPrice, { color: Colors.primary }]}>
                  ₵{plan.amount.toLocaleString()}
                </Text>
                <Text style={[styles.planInterval, { color: Colors.text }]}>
                  per {plan.name.toLowerCase()}
                </Text>
                {plan.description && (
                  <Text
                    style={[styles.planDescription, { color: Colors.text }]}
                  >
                    {plan.description}
                  </Text>
                )}
                <View style={styles.featuresList}>
                  <Text style={[styles.feature, { color: Colors.text }]}>
                    ✓ Unlimited debtors
                  </Text>
                  <Text style={[styles.feature, { color: Colors.text }]}>
                    ✓ Detailed analytics
                  </Text>
                  <Text style={[styles.feature, { color: Colors.text }]}>
                    ✓ Export reports
                  </Text>
                  <Text style={[styles.feature, { color: Colors.text }]}>
                    ✓ Priority support
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPlan && (
          <Button
            title={`Subscribe for ₵${selectedPlan.amount.toLocaleString()}`}
            onPress={handleSubscribe}
            disabled={isInitializing}
            loading={isInitializing}
            variant="primary"
            style={styles.subscribeButton}
          />
        )}
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
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
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
  },
  errorText: {
    fontSize: 16,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  planInterval: {
    fontSize: 16,
    marginBottom: 15,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
  },
  subscribeButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  verifyingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  verifyingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});
