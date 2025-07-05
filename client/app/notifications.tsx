import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Colors } from "@/Shared/Constants/Colors";

export default function Notifications() {

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.text, { color: Colors.text }]}>
        No notifications yet 📭
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
});
