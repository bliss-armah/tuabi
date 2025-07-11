import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { useRegisterMutation } from "@/Features/Authentication/AuthAPI";

export default function Register() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registerMutation] = useRegisterMutation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation({ name, email, password }).unwrap();
      Alert.alert(
        "Registration Successful",
        "You can now login with your credentials",
        [{ text: "OK", onPress: () => router.push("/login") }]
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration Failed";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
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
          Create your account
        </Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: Colors.card }]}>
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
          variant="primary"
          size="large"
        />

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={{ color: "#3498db", textAlign: "center", marginTop: 6 }}>
            Already have an account? Login
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
