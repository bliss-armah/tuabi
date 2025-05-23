import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoginMutation } from "./AuthAPI";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      await login({ username: email, password }).unwrap();
      router.push("/(tabs)/home");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white p-6 justify-center">
        {/* Logo and Title */}
        <View className="items-center mb-8">
          <View className="flex-row items-center mb-8">
            <View className="bg-indigo-600 p-2 rounded-lg mr-2">
              <Ionicons name="image-outline" size={20} color="white" />
            </View>
            <Text className="text-2xl font-bold text-indigo-900">Tuabi</Text>
          </View>
          <Text className="text-3xl font-bold text-indigo-900 mb-8">
            Welcome back!
          </Text>
        </View>

        {/* Input Fields */}
        <View className="mb-6">
          <TextInput
            className="border border-gray-300 rounded-lg p-4 mb-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View className="items-end mt-2">
            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <Text className="text-indigo-600 font-medium">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember Me */}
        <TouchableOpacity
          className="flex-row items-center mb-6"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            className={`w-5 h-5 rounded mr-2 ${
              rememberMe ? "bg-indigo-600" : "border border-gray-300"
            }`}
          >
            {rememberMe && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text className="text-gray-800">Remember me</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          className={`bg-indigo-600 py-4 rounded-lg mb-4 ${
            isLoading ? "opacity-50" : ""
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold text-center">
            {isLoading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center justify-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google Login */}
        <TouchableOpacity className="flex-row justify-center items-center border border-gray-300 py-4 rounded-lg mb-6">
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text className="text-gray-800">Continue with Google</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-800">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-indigo-600 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
