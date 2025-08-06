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
import { Button } from "@/Shared/Components/UIKitten";

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
              color: debtor.amountOwed > 0 ? Colors.text : Colors.secondary,
            },
          ]}
        >
          GHS {Math.abs(debtor.amountOwed).toFixed(2)}
        </Text>
      </View>

      {debtor.description && (
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color={Colors.icon} />
          <Text style={styles.infoText}>{debtor.description}</Text>
        </View>
      )}

      {debtor.phoneNumber && (
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color={Colors.icon} />
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
        <Ionicons name="calendar" size={20} color={Colors.icon} />
        <Text style={styles.infoText}>
          Created on {formatDate(debtor.createdAt)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title={`Record Payment`}
          onPress={onAddPayment}
          variant="secondary"
          icon={<Ionicons name="arrow-down" size={18} color={Colors.primary} />}
        />
        <Button
          title={`Add Debt`}
          onPress={onAddDebt}
          variant="primary"
          icon={<Ionicons name="arrow-up" size={18} color={Colors.white} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debtorInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: Colors.black,
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
    borderBottomColor: Colors.border,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  amountStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
  },
  callButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  callButtonText: {
    color: Colors.white,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
});
