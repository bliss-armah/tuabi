import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface LoadingViewProps {
  theme: keyof typeof Colors;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ theme }) => {
  return (
    <View
      style={[
        styles.loadingContainer,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <ActivityIndicator size="large" color={Colors[theme].primary} />
      <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
        Loading debtor details...
      </Text>
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
