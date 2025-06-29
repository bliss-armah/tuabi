import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // Add your registration logic here
      console.log("Register attempt:", { name, email, password });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
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
          Create your account
        </Text>
      </View>

      <View
        style={[styles.formContainer, { backgroundColor: Colors[theme].card }]}
      >
        <Input
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          status="basic"
        />

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

        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          status="basic"
        />

        <Button
          title="Register"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          status="primary"
          size="large"
        />

        <Button
          title="Already have an account? Login"
          onPress={() => router.push("/login")}
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
    marginTop: 60,
    marginBottom: 30,
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
