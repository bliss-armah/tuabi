import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import SubscriptionStatus from "@/Features/Subscription/SubscriptionStatus";
import { router } from "expo-router";

export default function PlansScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Plans</Text>
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
    paddingTop: 10,
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
    paddingBottom: 100, // Add padding for floating tab bar
  },
});
