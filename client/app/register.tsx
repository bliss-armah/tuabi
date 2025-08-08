import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/Shared/Constants/Colors";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { useRegisterMutation } from "@/Features/Authentication/AuthAPI";

export default function Register() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registerMutation] = useRegisterMutation();

  const handleRegister = async () => {
    if (!name || !phoneNumber || !email || !password) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Name, Email, Phone Number, Password)"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const registerData = {
        name,
        email,
        phoneNumber,
        password,
      };

      await registerMutation(registerData).unwrap();
      Alert.alert(
        "Registration Successful",
        "You can now login with your email or phone number and password",
        [{ text: "OK", onPress: () => router.push("/") }]
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration Failed";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <View style={{ flex: 1 }}>
        <StatusBar style={"dark"} />
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: Colors.primary }]}>
            Tuabi
          </Text>
          <Text style={[styles.tagline, { color: Colors.text }]}>
            Create your account
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={[styles.formContainer, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            status="basic"
          />
          <Input
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            status="basic"
          />
          <Input
            placeholder="Phone Number (e.g., 0245289983)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
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
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text
              style={{ color: "#3498db", textAlign: "center", marginTop: 6 }}
            >
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <SafeAreaView style={styles.bottomButtonContainer}>
          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
            style={styles.bottomButton}
          />
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
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
  bottomButtonContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomButton: {
    width: "100%",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
