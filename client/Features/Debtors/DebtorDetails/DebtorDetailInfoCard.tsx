import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";

interface DebtorDetailInfoCardProps {
  debtor: any;
  onAddPayment: () => void;
  onAddDebt: () => void;
}

export const DebtorDetailInfoCard: React.FC<DebtorDetailInfoCardProps> = ({
  debtor,
  onAddPayment,
  onAddDebt,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleCallDebtor = () => {
    if (!debtor?.phoneNumber) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    const phoneNumber = debtor.phoneNumber.replace(/\D/g, "");
    const url =
      Platform.OS === "android"
        ? `tel:${phoneNumber}`
        : `telprompt:${phoneNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
        Alert.alert("Error", "Phone call not supported on this device");
      })
      .catch((err) => {
        console.error("Error making phone call:", err);
        Alert.alert("Error", "Could not make phone call");
      });
  };

  return (
    <View
      style={[
        styles.debtorInfoCard,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
        },
      ]}
    >
      <View
        style={[styles.amountContainer, { borderBottomColor: Colors.border }]}
      >
        <Text style={[styles.amountLabel, { color: Colors.text }]}>
          Total Amount Owed
        </Text>
        <Text
          style={[
            styles.amountValue,
            {
              color: debtor.amountOwed > 0 ? Colors.accent : Colors.primary,
            },
          ]}
        >
          GHS {Math.abs(debtor.amountOwed).toFixed(2)}
        </Text>
        <Text style={[styles.amountStatus, { color: Colors.text }]}>
          {debtor.amountOwed > 0 ? "Outstanding" : "Settled"}
        </Text>
      </View>

      {debtor.description && (
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <Text style={styles.infoText}>{debtor.description}</Text>
        </View>
      )}

      {debtor.phoneNumber && (
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#3498db" />
          <Text style={styles.infoText}>{debtor.phoneNumber}</Text>
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: Colors.primary }]}
            onPress={handleCallDebtor}
          >
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="calendar" size={20} color="#3498db" />
        <Text style={styles.infoText}>
          Created on {formatDate(debtor.createdAt)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
          onPress={onAddPayment}
        >
          <Ionicons name="arrow-down" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Record Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accent }]}
          onPress={onAddDebt}
        >
          <Ionicons name="arrow-up" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Add Debt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debtorInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  amountLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  amountStatus: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#34495e",
    marginLeft: 10,
    flex: 1,
  },
  callButton: {
    backgroundColor: "#3498db",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  callButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
});
