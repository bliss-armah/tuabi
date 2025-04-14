import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CardComponent from "@/Shared/Components/CardComponent";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-indigo-600/85">
      {/* Top Section with SafeArea */}
      <SafeAreaView className="flex-1 justify-center items-center">
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
      </SafeAreaView>

      {/* Bottom Section: Remove SafeAreaView to allow full height */}
      <View className="flex-[0.8] justify-between bg-white p-8 rounded-t-3xl">
        <View className="flex-row flex-wrap mb-4 gap-y-7">
          {cardData.map((card, index) => (
            <CardComponent
              key={index}
              iconName={card.iconName}
              text={card.text}
            />
          ))}
        </View>

        <View>
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
      </View>
    </View>
  );
}

const cardData = [
  { iconName: "cash-outline", text: "Track Who Owes You" },
  { iconName: "pencil-outline", text: "Adjust & Add Notes" },
  { iconName: "trending-up-outline", text: "Stay Organized With Summaries" },
];
