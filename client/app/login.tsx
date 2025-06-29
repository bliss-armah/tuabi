import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Add your login logic here
      console.log("Login attempt:", { email, password });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: Colors[theme].primary }]}>
          Tuabi
        </Text>
        <Text style={[styles.tagline, { color: Colors[theme].text }]}>
          Track customer debts with ease
        </Text>
      </View>

      <View
        style={[styles.formContainer, { backgroundColor: Colors[theme].card }]}
      >
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          status="basic"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          status="basic"
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          status="primary"
          size="large"
        />

        <Button
          title="Don't have an account? Register"
          onPress={() => router.push("/register")}
          appearance="ghost"
          status="primary"
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 50,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  tagline: {
    fontSize: 16,
    marginTop: 10,
  },
  formContainer: {
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
