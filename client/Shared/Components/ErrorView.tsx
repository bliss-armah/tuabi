import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface ErrorViewProps {
  theme: keyof typeof Colors;
  error: any;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  theme,
  error,
  onRetry,
}) => {
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.data?.message || "An error occurred";

  return (
    <View
      style={[
        styles.errorContainer,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: Colors[theme].primary }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
