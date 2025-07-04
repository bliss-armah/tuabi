import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import { Input, Button } from "@/Shared/Components/UIKitten";

interface PaymentModalProps {
  visible: boolean;
  isAddingDebt: boolean;
  paymentAmount: string;
  paymentNote: string;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  isAddingDebt,
  paymentAmount,
  paymentNote,
  onAmountChange,
  onNoteChange,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isAddingDebt ? "Add Debt" : "Record Payment"}
          </Text>
          
          <Input
            label="Amount ($)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={paymentAmount}
            onChangeText={onAmountChange}
            status="basic"
          />
          
          <Input
            label="Note (Optional)"
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            value={paymentNote}
            onChangeText={onNoteChange}
            status="basic"
          />
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={onCancel}
              appearance="outline"
              status="basic"
              size="medium"
              style={styles.cancelButton}
            />
            <Button
              title="Save"
              onPress={onSave}
              status="primary"
              size="medium"
              style={styles.saveButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});