import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface DebtorHeaderProps {
  title: string;
  actionButton?: React.ReactNode;
  onTap: () => void;
}

export const DebtorHeader: React.FC<DebtorHeaderProps> = ({
  title,
  actionButton,
  onTap,
}) => {
  return (
    <View style={[styles.header, { backgroundColor: Colors.primary }]}>
      <Text style={styles.headerTitle}>{title}</Text>

      {actionButton && (
        <TouchableOpacity onPress={onTap}>{actionButton}</TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
  },
});
