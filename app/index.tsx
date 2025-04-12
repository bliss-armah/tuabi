import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-purple-100">
      
        <View className="bg-purple-700 rounded-t-3xl p-10">
          <View className="flex-row items-center mb-4">
            <View className="bg-white rounded-lg p-1 mr-2">
              <Ionicons name="image-outline" size={24} color="purple" />
            </View>
            <Text className="text-2xl font-bold text-white">Tuabi</Text>
          </View>
          
          <Text className="text-[40px] font-bold text-white mb-2">
            Never forget who owes you again.
          </Text>
          
          <Text className="text-white text-base mb-4">
            Simplify. Automate. Get Paid.
          </Text>
          
          <View className="bg-white rounded-lg p-2 w-24 flex-row items-center mb-2">
            <View className="w-8 h-8 bg-purple-500 rounded-full mr-2 items-center justify-center">
              <Ionicons name="person-outline" size={20} color="white" />
            </View>
            <Text className="font-bold">$20</Text>
          </View>
          
          <View className="flex-row mt-4">
            <View className="flex-1">
              <Ionicons name="stats-chart" size={24} color="white" />
            </View>
            <Image
              source={require('@/assets/images/personphone.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
        </View>
        
        <View className="p-6">
          <View className="flex-row justify-between mb-4">
            <View className="bg-purple-600 rounded-xl w-[48%] p-4">
              <Ionicons name="cash-outline" size={24} color="white" />
              <Text className="text-white font-medium mt-2">Track Who Owes You</Text>
            </View>
            
            <View className="bg-purple-600 rounded-xl w-[48%] p-4">
              <Feather name="edit-2" size={24} color="white" />
              <Text className="text-white font-medium mt-2">Adjust & Add Notes</Text>
            </View>
          </View>
          
          <View className="bg-purple-600 rounded-xl p-4 mb-6">
            <Ionicons name="trending-up-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-2">Stay Organized With Summaries</Text>
          </View>
          
          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-full mb-4"
            onPress={() => router.push('/login')}
          >
            <Text className="text-white font-semibold text-center text-lg">Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Text className="text-center text-gray-600">Already have an account?</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}