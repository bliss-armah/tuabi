import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useCreateDebtorMutation } from "@/Features/Debtors/DebtorsApi";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";

export default function AddDebtorModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createDebtor] = useCreateDebtorMutation();

  const validateForm = () => {
    if (!name.trim()) return Alert.alert("Error", "Enter debtor name");
    if (!amount.trim() || isNaN(parseFloat(amount)))
      return Alert.alert("Error", "Enter valid amount");
    return true;
  };

  const handleAddDebtor = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await createDebtor({
        name,
        amountOwed: parseFloat(amount),
        phoneNumber: phoneNumber || null,
        description: description || null,
      }).unwrap();

      Alert.alert("Success", "Debtor added!");
      onClose(); // Close modal after success
    } catch (err: any) {
      Alert.alert("Error", err?.data?.detail || "Failed to add debtor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.header, { backgroundColor: color.primary }]}>
            <Text style={styles.headerTitle}>Add Debtor</Text>
            <Button title="Close" onPress={onClose} size="small" />
          </View>
          <View style={styles.form}>
            <Input label="Name *" value={name} onChangeText={setName} />
            <Input
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Input label="Note" value={note} onChangeText={setNote} multiline />
            <Button
              title="Add Debtor"
              onPress={handleAddDebtor}
              loading={isLoading}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
});
