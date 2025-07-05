import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface LoadingViewProps {
  text: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ text }) => {
  return (
    <View
      style={[styles.loadingContainer, { backgroundColor: Colors.background }]}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={[styles.loadingText, { color: Colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 16,
  },
});
