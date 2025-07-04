import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useGetDebtorQuery,
  useAddPaymentMutation,
  useDeleteDebtorMutation,
  useGetDebtorHistoryQuery,
} from "@/Features/Debtors/DebtorsApi";
import DebtorModal from "@/Features/Debtors/DebtorModal";
import { useDebtorModal } from "@/Shared/Hooks/useDebtorModal";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { ErrorView } from "@/Shared/Components/ErrorView";
import { DebtorDetailHeader } from "@/Features/Debtors/DebtorDetails/DebtorDetailHeader";
import { DebtorDetailInfoCard } from "@/Features/Debtors/DebtorDetails/DebtorDetailInfoCard";
import { PaymentHistory } from "@/Features/Debtors/DebtorDetails/PaymentHistory";
import { DeleteDebtorButton } from "@/Features/Debtors/DebtorDetails/DeleteDebtorButton";
import { PaymentModal } from "@/Features/Debtors/DebtorDetails/PaymentModal";

export default function DebtorDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const {
    isVisible,
    mode,
    debtor: hookDebtor,
    openEditDebtor,
    closeModal,
  } = useDebtorModal();

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

  const handleDeleteDebtor = async () => {
    try {
      await deleteDebtor(Number(id)).unwrap();
      Alert.alert("Success", "Debtor deleted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error deleting debtor:", err);
      Alert.alert("Error", "Failed to delete debtor");
    }
  };

  const openPaymentModal = (isDebt: boolean) => {
    setIsAddingDebt(isDebt);
    setModalVisible(true);
  };

  if (isLoading || historyLoading) {
    return <LoadingView theme={theme} text="Loading debtor details..." />;
  }

  if (error) {
    return <ErrorView theme={theme} error={error} onRetry={refetch} />;
  }

  if (!debtor) {
    return (
      <ErrorView
        theme={theme}
        error="Debtor not found"
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <ScrollView>
        <DebtorDetailHeader
          theme={theme}
          debtorName={debtor.data.name}
          onEdit={() => openEditDebtor(debtor?.data)}
        />

        <DebtorDetailInfoCard
          theme={theme}
          debtor={debtor.data}
          onAddPayment={() => openPaymentModal(false)}
          onAddDebt={() => openPaymentModal(true)}
        />

        <PaymentHistory theme={theme} history={history?.data} />

        <DeleteDebtorButton
          theme={theme}
          debtorName={debtor.data.name}
          onDelete={handleDeleteDebtor}
        />
      </ScrollView>

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

      <DebtorModal
        visible={isVisible}
        mode={mode}
        debtor={hookDebtor}
        onClose={closeModal}
        onSuccess={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
