import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-[#FFE8D6] justify-center items-center px-6">
      {/* <Image
        source={require('@/assets/images/icon.png')}
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      /> */}
      <Text className="text-3xl font-bold text-[#3C2A21] text-center mb-3">
        Welcome to Tuabi
      </Text>
      <Text className="text-base text-[#5C3A2E] text-center mb-6">
        Simplify the way you track debts and payments. Easy. Fun. Smart.
      </Text>
      <TouchableOpacity
        className="bg-[#7B3F00] px-6 py-3 rounded-full"
        onPress={() => navigation.navigate('Login')}
      >
        <Text className="text-white font-semibold text-lg">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
