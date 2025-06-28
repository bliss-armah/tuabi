import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
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
      await registerMutation({ name, email, password });
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
        <TextInput
          style={[
            styles.input,
            { borderColor: Colors[theme].border, color: Colors[theme].text },
          ]}
          placeholder="Full Name"
          placeholderTextColor={Colors[theme].icon}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: Colors[theme].border, color: Colors[theme].text },
          ]}
          placeholder="Email"
          placeholderTextColor={Colors[theme].icon}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: Colors[theme].border, color: Colors[theme].text },
          ]}
          placeholder="Password"
          placeholderTextColor={Colors[theme].icon}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: Colors[theme].border, color: Colors[theme].text },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={Colors[theme].icon}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.registerButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.loginText, { color: Colors[theme].primary }]}>
            Already have an account? Login
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
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  },
});
