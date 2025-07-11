import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { useLoginMutation } from "@/Features/Authentication/AuthAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";

export default function LoginScreen() {
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
      const response = await loginMutation({
        username: email,
        password,
      }).unwrap();
      if (response.data) {
        await AsyncStorage.setItem(
          "token",
          JSON.stringify(response.data.token)
        );
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      }
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
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
          variant="primary"
          size="large"
        />

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text
            style={{ color: "#3498db", textAlign: "center", marginTop: 6 }}
          >
            Don’t have an account?{" "}
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
