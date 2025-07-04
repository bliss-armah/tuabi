import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";

interface DebtorDetailHeaderProps {
  theme: keyof typeof Colors;
  debtorName: string;
  onEdit: () => void;
}

export const DebtorDetailHeader: React.FC<DebtorDetailHeaderProps> = ({
  theme,
  debtorName,
  onEdit,
}) => {
  return (
    <View style={[styles.header, { backgroundColor: Colors[theme].primary }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{debtorName}</Text>

      <TouchableOpacity
        style={[
          styles.editButton,
          { backgroundColor: Colors[theme].secondary },
        ]}
        onPress={onEdit}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#3498db",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
