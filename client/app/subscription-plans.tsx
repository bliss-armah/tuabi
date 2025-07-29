import React, { useState, useEffect } from "react";
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
  useRefreshSubscriptionStatusMutation,
  SubscriptionPlan,
} from "@/Features/Subscription/SubscriptionAPI";
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
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { data: plans, isLoading, error } = useGetSubscriptionPlansQuery();
  const [initializePayment, { isLoading: isInitializing }] =
    useInitializeSubscriptionPaymentMutation();
  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifySubscriptionPaymentMutation();
  const [refreshStatus] = useRefreshSubscriptionStatusMutation();
  const { refetch: refetchStatus } = useGetUserSubscriptionStatusQuery();

  const { popup } = usePaystack();

  // Auto-refresh subscription status when component mounts
  useEffect(() => {
    refetchStatus();
  }, [refetchStatus]);

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a plan first");
      return;
    }

    if (!user || !user.email) {
      Alert.alert("Error", "User information not found");
      return;
    }

    try {
      setIsProcessing(true);

      // Initialize payment to get reference and access code
      const response = await initializePayment({
        email: user.email,
        amount: selectedPlan.amount,
        planId: selectedPlan.id.toString(),
        currency: "GHS",
      }).unwrap();

      if (!response.status || !response.data.reference) {
        Alert.alert("Error", "Failed to initialize payment");
        setIsProcessing(false);
        return;
      }

      // Use Paystack popup for in-app payment
      popup.checkout({
        email: user.email,
        amount: selectedPlan.amount, // Paystack expects amount in kobo/pesewas
        reference: response.data.reference,
        metadata: {
          planId: selectedPlan.id.toString(),
          userId: user.id?.toString(),
          planName: selectedPlan.name,
          description: `${selectedPlan.name} subscription payment`,
        },
        onSuccess: async (transaction) => {
          // Payment successful, now verify on backend
          await handlePaymentSuccess(transaction.reference);
        },
        onCancel: () => {
          setIsProcessing(false);
          Alert.alert("Payment Cancelled", "Your payment was cancelled");
        },
        onError: (error) => {
          setIsProcessing(false);
          Alert.alert(
            "Payment Error",
            error.message || "An error occurred during payment"
          );
        },
      });
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert("Error", error?.data?.message || "Failed to process payment");
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Verify payment on your backend - your backend only needs reference
      const verificationResponse = await verifyPayment({
        reference: reference,
      }).unwrap();

      if (verificationResponse.status) {
        // Payment verified successfully
        console.log(
          "Payment verification response:",
          verificationResponse.data
        );

        // Check if subscription was processed
        if (verificationResponse.data.subscription_active) {
          console.log("Subscription is active, refreshing status...");
        } else {
          console.log("Subscription not yet active, waiting for webhook...");
        }

        // Refresh user subscription status immediately
        await Promise.all([refetchStatus(), refreshStatus()]);

        // If subscription is not active yet, wait a bit and check again
        if (!verificationResponse.data.subscription_active) {
          console.log("Waiting for subscription to be processed...");
          setTimeout(async () => {
            try {
              await Promise.all([refetchStatus(), refreshStatus()]);
              console.log("Subscription status refreshed after delay");
            } catch (error) {
              console.error(
                "Error refreshing subscription after delay:",
                error
              );
            }
          }, 3000); // Wait 3 seconds
        }

        setIsProcessing(false);
        Alert.alert(
          "Payment Successful",
          "Your subscription has been activated successfully!",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setIsProcessing(false);
      Alert.alert(
        "Verification Error",
        error?.data?.message ||
          "Failed to verify payment. Please contact support if you were charged.",
        [
          {
            text: "Contact Support",
            onPress: () => {
              // Navigate to support or show contact info
              // You could add a support screen navigation here
            },
          },
          {
            text: "Try Again",
            onPress: () => handleSubscribe(),
          },
        ]
      );
    }
  };

  const isLoaderVisible =
    isLoading || isInitializing || isVerifying || isProcessing;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Loading overlay */}
      {isLoaderVisible && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.text }]}>
            {isLoading
              ? "Loading plans..."
              : isInitializing
              ? "Initializing payment..."
              : isVerifying
              ? "Verifying payment..."
              : "Processing payment..."}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoaderVisible}
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
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.centerText, { color: Colors.text }]}>
              Loading plans...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: Colors.text }]}>
              Failed to load subscription plans
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: Colors.primary }]}
              onPress={() => window.location.reload()} // or refetch
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {plans?.data.map((plan: SubscriptionPlan) => (
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
                    opacity: isLoaderVisible ? 0.5 : 1,
                  },
                ]}
                onPress={() => !isLoaderVisible && handlePlanSelection(plan)}
                disabled={isLoaderVisible}
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

                {selectedPlan?.id === plan.id && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: Colors.primary },
                    ]}
                  >
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPlan && (
          <Button
            title={`Subscribe for ₵${selectedPlan.amount.toLocaleString()}`}
            onPress={handleSubscribe}
            disabled={isLoaderVisible}
            loading={isLoaderVisible}
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  centerText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    position: "relative",
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
  selectedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  subscribeButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
