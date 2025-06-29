import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreateDebtorMutation,
  useAddPaymentMutation,
} from "@/Features/Debtors/DebtorsApi";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";

export default function AddDebtor() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createDebtor] = useCreateDebtorMutation();
  const [addPayment] = useAddPaymentMutation();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter the debtor name");
      return false;
    }

    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return false;
    }

    return true;
  };

  const handleAddDebtor = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const debtorData = {
        name: name.trim(),
        description: description.trim() || null,
        phone_number: phoneNumber.trim() || null,
      };

      const response = await createDebtor(debtorData).unwrap();
      const debtorId = response.id;

      // Add initial debt/payment
      const paymentData = {
        debtor_id: debtorId,
        amount: parseFloat(amount),
        note: note.trim() || null,
        payment_type: parseFloat(amount) > 0 ? "debt" : "payment",
      };

      await addPayment(paymentData).unwrap();

      Alert.alert("Success", "Debtor added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error adding debtor:", error);
      let errorMessage = "Failed to add debtor";
      if (error.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={[styles.container]}>
        <View
          style={[styles.header, { backgroundColor: Colors[theme].primary }]}
        >
          <Button
            title=""
            onPress={() => router.back()}
            appearance="ghost"
            status="basic"
            size="small"
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Add New Debtor</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Name *"
            placeholder="Enter debtor name"
            value={name}
            onChangeText={setName}
            status="basic"
          />

          <Input
            label="Initial Amount Owed *"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            status="basic"
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            status="basic"
          />

          <Input
            label="Description (Optional)"
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            status="basic"
          />

          <Input
            label="Note for Initial Debt (Optional)"
            placeholder="Add a note for this initial debt"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
            status="basic"
          />

          <Button
            title="Add Debtor"
            onPress={handleAddDebtor}
            loading={isLoading}
            disabled={isLoading}
            status="primary"
            size="large"
            style={styles.addButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  formContainer: {
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
  addButton: {
    marginTop: 10,
  },
});
