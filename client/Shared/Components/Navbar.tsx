import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Colors } from "@/Shared/Constants/Colors";
import { router } from "expo-router";
import { useAuth } from "../Hooks/useAuth";

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.greeting,{ color: Colors.gray }]}>Hi, {user?.name}</Text>
      <TouchableOpacity
        onPress={() => router.push("/notifications")}
        style={styles.iconButton}
      >
        <Ionicons name="notifications-outline" size={24}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",

  },
  iconButton: {
    padding: 5,
  },
});
