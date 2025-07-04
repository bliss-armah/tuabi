import React from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";

interface DeleteDebtorButtonProps {
  theme: keyof typeof Colors;
  debtorName: string;
  onDelete: () => void;
}

export const DeleteDebtorButton: React.FC<DeleteDebtorButtonProps> = ({
  theme,
  debtorName,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${debtorName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: Colors[theme].accent }]}
      onPress={handleDelete}
    >
      <Ionicons name="trash" size={20} color="#fff" />
      <Text style={styles.deleteButtonText}>Delete Debtor</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
