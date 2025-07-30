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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {debtorName}
      </Text>

      <View style={styles.sideButtonContainer}>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create" size={24} color={Colors.white} />
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
  },
  sideButtonContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginHorizontal: 8,
  },
});
