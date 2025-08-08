import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { useLoginMutation } from "@/Features/Authentication/AuthAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";

export default function Login() {
  const [loginMutation] = useLoginMutation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter both email/phone number and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginMutation({
        identifier,
        password,
      }).unwrap();

      if (response.data) {
        // Save authentication data
        await AsyncStorage.setItem(
          "token",
          JSON.stringify(response.data.token)
        );
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "No data received from server");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different types of errors
      let errorMessage = "Invalid email/phone number or password";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={"dark"} />
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: Colors.primary }]}>Tuabi</Text>
        <Text style={[styles.tagline, { color: Colors.text }]}>
          Track customer debts with ease
        </Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: Colors.card }]}>
        <Input
          placeholder="Email or Phone Number"
          value={identifier}
          onChangeText={setIdentifier}
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
          variant="primary"
          size="large"
        />

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={{ color: "#3498db", textAlign: "center", marginTop: 6 }}>
            Don't have an account?{" "}
            <Text style={{ fontWeight: "bold" }}>Register</Text>
          </Text>
        </TouchableOpacity>
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
