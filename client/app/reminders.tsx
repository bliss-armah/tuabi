import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import RemindersList from "@/Features/Reminders/RemindersList";

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <RemindersList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
