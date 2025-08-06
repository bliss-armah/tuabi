import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/Shared/Constants/Colors";
import {
  useGetDebtorQuery,
  useAddPaymentMutation,
  useGetDebtorHistoryQuery,
} from "@/Features/Debtors/DebtorsApi";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { ErrorView } from "@/Shared/Components/ErrorView";
import { DebtorDetailInfoCard } from "@/Features/Debtors/DebtorDetails/DebtorDetailInfoCard";
import { PaymentHistory } from "@/Features/Debtors/DebtorDetails/PaymentHistory";
import { PaymentModal } from "@/Features/Debtors/DebtorDetails/PaymentModal";
import RemindersList from "@/Features/Reminders/RemindersList";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function DebtorDetail() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { id } = useLocalSearchParams();

  const {
    data: debtor,
    isLoading,
    error,
    refetch,
  } = useGetDebtorQuery(Number(id));

  const {
    data: history,
    isLoading: historyLoading,
    refetch: historyRefetch,
  } = useGetDebtorHistoryQuery(Number(id));

  const [addPayment] = useAddPaymentMutation();
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
      const finalAmount = isAddingDebt ? Math.abs(amount) : -Math.abs(amount);

      await addPayment({
        id: Number(id),
        data: {
          amount: finalAmount,
          note: paymentNote || undefined,
          action: isAddingDebt ? "add" : "reduce",
        },
      });

      setPaymentAmount("");
      setPaymentNote("");
      setModalVisible(false);
      refetch();
      historyRefetch();
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

  const openPaymentModal = (isDebt: boolean) => {
    setIsAddingDebt(isDebt);
    setModalVisible(true);
  };

  if (isLoading || historyLoading) {
    return <LoadingView text="Loading debtor details..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  if (!debtor) {
    return <ErrorView error="Debtor not found" onRetry={() => router.back()} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: Colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>
          {debtor.data.name}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(`/edit-debtor?mode=edit&debtorId=${debtor.data.id}`)
          }
        >
          <Ionicons name="create" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1]}
        keyExtractor={() => "static"}
        renderItem={() => (
          <>
            <DebtorDetailInfoCard
              debtor={debtor.data}
              onAddPayment={() => openPaymentModal(false)}
              onAddDebt={() => openPaymentModal(true)}
            />
            <PaymentHistory history={history?.data} />
            <RemindersList
              debtorId={Number(id)}
              debtorName={debtor.data.name}
            />
          </>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
      <PaymentModal
        visible={modalVisible}
        isAddingDebt={isAddingDebt}
        paymentAmount={paymentAmount}
        paymentNote={paymentNote}
        onAmountChange={setPaymentAmount}
        onNoteChange={setPaymentNote}
        onSave={handleAddPayment}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    marginLeft: 15,
  },
});
