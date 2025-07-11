import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";

interface DebtorDetailHeaderProps {
  debtorName: string;
  onEdit: () => void;
}

export const DebtorDetailHeader: React.FC<DebtorDetailHeaderProps> = ({
  debtorName,
  onEdit,
}) => {
  return (
    <View style={[styles.header, { backgroundColor: Colors.primary }]}>
      <View style={styles.sideButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {debtorName}
      </Text>

      <View style={styles.sideButtonContainer}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: Colors.secondary }]}
          onPress={onEdit}
        >
          <Ionicons name="create" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    // backgroundColor: "#3498db", // Remove hardcoded color
  },
  sideButtonContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 8,
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
