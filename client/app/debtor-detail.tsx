import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useGetDebtorQuery,
  useAddPaymentMutation,
  useDeleteDebtorMutation,
  useGetDebtorHistoryQuery,
} from "@/Features/Debtors/DebtorsApi";

type DebtHistory = {
  id: number;
  amount_changed: number;
  note: string | null;
  timestamp: string;
  action: string;
};

type Debtor = {
  id: number;
  name: string;
  amount_owed: number;
  description: string;
  phone_number: string | null;
  created_at: string;
  updated_at: string | null;
  history: DebtHistory[];
};

export default function DebtorDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const {
    data: debtor,
    isLoading,
    error,
    refetch,
  } = useGetDebtorQuery(Number(id));
  const { data: history, isLoading: historyLoading } = useGetDebtorHistoryQuery(
    Number(id)
  );
  const [addPayment] = useAddPaymentMutation();
  const [deleteDebtor] = useDeleteDebtorMutation();

  console.log("history", history);

  const [modalVisible, setModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [isAddingDebt, setIsAddingDebt] = useState(false);

  const handleAddPayment = async () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);
      // If adding debt, amount is positive; if recording payment, amount is negative
      const finalAmount = isAddingDebt ? Math.abs(amount) : -Math.abs(amount);

      await addPayment({
        id: Number(id),
        data: {
          amount_changed: finalAmount,
          note: paymentNote || null,
        },
      });

      setPaymentAmount("");
      setPaymentNote("");
      setModalVisible(false);

      Alert.alert(
        "Success",
        isAddingDebt
          ? "Debt added successfully"
          : "Payment recorded successfully"
      );
    } catch (err) {
      console.error("Error adding payment:", err);
      Alert.alert("Error", "Failed to record payment");
    }
  };

  const handleCallDebtor = () => {
    if (!debtor?.phone_number) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    const phoneNumber = debtor.phone_number.replace(/\D/g, "");
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

  const handleDeleteDebtor = () => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${debtor?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDebtor(Number(id)).unwrap();
              Alert.alert("Success", "Debtor deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error("Error deleting debtor:", err);
              Alert.alert("Error", "Failed to delete debtor");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (isLoading || historyLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[theme].primary} />
        <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
          Loading debtor details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <Text style={styles.errorText}>{error?.data?.message}</Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!debtor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Debtor not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <ScrollView>
        <View
          style={[styles.header, { backgroundColor: Colors[theme].primary }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{debtor.name}</Text>
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: Colors[theme].secondary },
            ]}
            onPress={() => router.push(`/edit-debtor?id=${debtor.id}` as any)}
          >
            <Ionicons name="create" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.debtorInfoCard,
            {
              backgroundColor: Colors[theme].card,
              borderColor: Colors[theme].border,
            },
          ]}
        >
          <View
            style={[
              styles.amountContainer,
              { borderBottomColor: Colors[theme].border },
            ]}
          >
            <Text style={[styles.amountLabel, { color: Colors[theme].text }]}>
              Total Amount Owed
            </Text>
            <Text
              style={[
                styles.amountValue,
                debtor.amount_owed > 0
                  ? styles.positiveAmount
                  : styles.zeroAmount,
              ]}
            >
              ${Math.abs(debtor.amount_owed).toFixed(2)}
            </Text>
            <Text style={styles.amountStatus}>
              {debtor.amount_owed > 0 ? "Outstanding" : "Settled"}
            </Text>
          </View>

          {debtor.description && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color="#3498db" />
              <Text style={styles.infoText}>{debtor.description}</Text>
            </View>
          )}

          {debtor.phone_number && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#3498db" />
              <Text style={styles.infoText}>{debtor.phone_number}</Text>
              <TouchableOpacity
                style={[
                  styles.callButton,
                  { backgroundColor: Colors[theme].primary },
                ]}
                onPress={handleCallDebtor}
              >
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#3498db" />
            <Text style={styles.infoText}>
              Created on {formatDate(debtor.created_at)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors[theme].secondary },
              ]}
              onPress={() => {
                setIsAddingDebt(false);
                setModalVisible(true);
              }}
            >
              <Ionicons name="arrow-down" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Record Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors[theme].accent },
              ]}
              onPress={() => {
                setIsAddingDebt(true);
                setModalVisible(true);
              }}
            >
              <Ionicons name="arrow-up" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Add Debt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.historyContainer,
            { backgroundColor: Colors[theme].card },
          ]}
        >
          <Text style={[styles.historyTitle, { color: Colors[theme].text }]}>
            Payment History
          </Text>

          {history?.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="time" size={40} color="#bdc3c7" />
              <Text style={styles.emptyHistoryText}>
                No payment history yet
              </Text>
            </View>
          ) : (
            history?.map((item: DebtHistory) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyLeft}>
                    <Ionicons
                      name={
                        item.action === "add" ? "add-circle" : "remove-circle"
                      }
                      size={20}
                      color={
                        item.action === "add"
                          ? Colors[theme].accent
                          : Colors[theme].primary
                      }
                    />
                    <Text style={styles.historyAction}>
                      {item.action === "add"
                        ? "Debt Added"
                        : item.action === "reduce"
                        ? "Payment Received"
                        : "Settled"}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {formatDate(item.timestamp)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.historyAmount,
                    item.action === "add"
                      ? styles.positiveAmount
                      : styles.negativeAmount,
                  ]}
                >
                  {item.action === "add" ? "+" : "-"}$
                  {Math.abs(item.amount_changed).toFixed(2)}
                </Text>

                {item.note && (
                  <Text style={styles.historyNote}>{item.note}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: Colors[theme].accent },
          ]}
          onPress={handleDeleteDebtor}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete Debtor</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isAddingDebt ? "Add Debt" : "Record Payment"}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Add a note..."
                multiline
                value={paymentNote}
                onChangeText={setPaymentNote}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddPayment}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
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
  positiveAmount: {
    color: Colors[theme].accent,
  },
  negativeAmount: {
    color: Colors[theme].primary,
  },
  zeroAmount: {
    color: Colors[theme].primary,
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
  paymentButton: {
    backgroundColor: Colors[theme].primary,
    marginRight: 5,
  },
  debtButton: {
    backgroundColor: Colors[theme].accent,
    marginLeft: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  historyContainer: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 10,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 15,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyAction: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 10,
  },
  historyDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  historyNote: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  noteInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ecf0f1",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#7f8c8d",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3498db",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
