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
import { authService } from "../Shared/Api/api";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { useLoginMutation } from "@/Features/Authentication/AuthAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [loginMutation] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginMutation({ username: email, password }).unwrap();
      if (response.access_token) {
        await AsyncStorage.setItem("access_token", response.access_token);
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Invalid email or password");
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

        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.registerText, { color: Colors[theme].primary }]}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    color: "#3498db",
  },
  tagline: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "#fff",
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
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#3498db",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#3498db",
    fontSize: 14,
  },
});
