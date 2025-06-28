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
  SubscriptionPlan,
} from "@/Features/Subscription/SubscriptionAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

export default function SubscriptionPlansScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const { data: plans, isLoading, error } = useGetSubscriptionPlansQuery();
  const [initializePayment, { isLoading: isInitializing }] =
    useInitializeSubscriptionPaymentMutation();

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a plan first");
      return;
    }

    try {
      const userString = await AsyncStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.email) {
        Alert.alert("Error", "User information not found");
        return;
      }

      const response = await initializePayment({
        email: user.email,
        amount: selectedPlan.amount,
        plan_type: selectedPlan.id,
        currency: selectedPlan.currency,
      }).unwrap();

      if (response.status && response.data.authorization_url) {
        setPaymentUrl(response.data.authorization_url);
        setShowWebView(true);
      } else {
        Alert.alert("Error", "Failed to initialize payment");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process payment");
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    // Check if payment was successful (you might need to adjust this based on your callback URL)
    if (navState.url.includes("success") || navState.url.includes("callback")) {
      setShowWebView(false);
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
    }
  };

  if (showWebView) {
    return (
      <View style={styles.container}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowWebView(false)}
          >
            <Text
              style={[styles.closeButtonText, { color: Colors[theme].primary }]}
            >
              Close
            </Text>
          </TouchableOpacity>
          <Text style={[styles.webViewTitle, { color: Colors[theme].text }]}>
            Complete Payment
          </Text>
        </View>
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          style={styles.webView}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text
            style={[styles.backButtonText, { color: Colors[theme].primary }]}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Choose Your Plan
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: Colors[theme].text }]}>
          Select a subscription plan to unlock all features
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[theme].primary} />
            <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
              Loading plans...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Colors[theme].error }]}>
              Failed to load subscription plans
            </Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {plans?.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: Colors[theme].card,
                    borderColor:
                      selectedPlan?.id === plan.id
                        ? Colors[theme].primary
                        : Colors[theme].border,
                  },
                ]}
                onPress={() => handlePlanSelection(plan)}
              >
                <View style={styles.planHeader}>
                  <Text
                    style={[styles.planName, { color: Colors[theme].text }]}
                  >
                    {plan.name}
                  </Text>
                  {plan.id === "yearly" && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>Save 20%</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.planPrice, { color: Colors[theme].primary }]}
                >
                  ₦{plan.amount.toLocaleString()}
                </Text>
                <Text
                  style={[styles.planInterval, { color: Colors[theme].text }]}
                >
                  per {plan.interval}
                </Text>

                {plan.description && (
                  <Text
                    style={[
                      styles.planDescription,
                      { color: Colors[theme].text },
                    ]}
                  >
                    {plan.description}
                  </Text>
                )}

                <View style={styles.featuresList}>
                  <Text style={[styles.feature, { color: Colors[theme].text }]}>
                    ✓ Unlimited debtors
                  </Text>
                  <Text style={[styles.feature, { color: Colors[theme].text }]}>
                    ✓ Detailed analytics
                  </Text>
                  <Text style={[styles.feature, { color: Colors[theme].text }]}>
                    ✓ Export reports
                  </Text>
                  <Text style={[styles.feature, { color: Colors[theme].text }]}>
                    ✓ Priority support
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPlan && (
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              { backgroundColor: Colors[theme].primary },
            ]}
            onPress={handleSubscribe}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                Subscribe for ₦{selectedPlan.amount.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: "#27ae60",
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
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  closeButton: {
    marginRight: 15,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  webView: {
    flex: 1,
  },
});
