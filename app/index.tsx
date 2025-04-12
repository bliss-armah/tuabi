import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-indigo-600/85 ">
      <View className="p-10">
        <View className="flex-row items-center mb-4">
          <View className="bg-white rounded-lg p-1 mr-2">
            <Ionicons name="image-outline" size={24} color="#4F46E5" />
          </View>
          <Text className="text-2xl font-bold text-white">Tuabi</Text>
        </View>

        <Text className="text-[40px] font-bold text-white mb-2 leading-tight">
          Never forget who owes you again.
        </Text>

        <Text className="text-white text-base mb-4">
          Simplify. Automate. Get Paid.
        </Text>

        <View className="bg-white rounded-lg p-2 w-24 flex-row items-center mb-2">
          <View className="w-8 h-8 bg-indigo-600 rounded-full mr-2 items-center justify-center flex">
            <Ionicons name="person-outline" size={20} color="white" />
          </View>
          <Text className="font-bold text-indigo-900">$20</Text>
        </View>

        <View className="flex-row mt-4 items-center justify-between">
          <View className="flex-1">
            <Ionicons name="stats-chart" size={24} color="white" />
          </View>
          <Image
            source={require("@/assets/images/personphone.png")}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="flex-1 bg-white p-8 rounded-t-3xl">
        <View className="flex-row flex-wrap mb-4 gap-y-4">
          <View className="flex-row items-center gap-x-2">
            <View className="bg-indigo-600 rounded-xl w-[70px] h-[70px] flex justify-center items-center">
              <Ionicons name="cash-outline" size={20} color="white" />
            </View>
            <Text className="w-[100px] font-medium mt-2">
              Track Who Owes You
            </Text>
          </View>

          <View className="flex-row items-center gap-x-2">
            <View className="bg-indigo-600 rounded-xl w-[70px] h-[70px] flex justify-center items-center">
              <Feather name="edit-2" size={20} color="white" />
            </View>
            <Text className="w-[100px] font-medium mt-2">
              Adjust & Add Notes
            </Text>
          </View>

          <View className="flex-row items-center gap-x-2">
            <View className="bg-indigo-600 rounded-xl w-[70px] h-[70px] flex justify-center items-center">
              <Ionicons name="trending-up-outline" size={20} color="white" />
            </View>
            <Text className="w-[100px] font-medium mt-2">
              Stay Organized With Summaries
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-indigo-600 py-4 rounded-full mb-4"
          onPress={() => router.push("/login")}
        >
          <Text className="text-white font-semibold text-center text-lg">
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-center text-gray-600">
            Already have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
