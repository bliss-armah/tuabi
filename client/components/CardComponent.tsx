import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface CardComponentProps {
  iconName: any;
  iconColor?: string;
  iconSize?: number;
  backgroundColor?: string;
  text: string;
  textWidth?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({
  iconName,
  iconColor = "white",
  iconSize = 20,
  backgroundColor = "bg-indigo-600",
  text,
  textWidth = "w-[100px]",
}) => {
  return (
    <View className="flex-row items-center gap-x-2">
      <View
        className={`${backgroundColor} rounded-xl w-[70px] h-[70px] flex justify-center items-center`}
      >
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      </View>
      <Text className={`${textWidth} font-medium mt-2`}>{text}</Text>
    </View>
  );
};

export default CardComponent;
