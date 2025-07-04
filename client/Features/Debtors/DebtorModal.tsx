// components/DebtorModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
} from "@/Features/Debtors/DebtorsApi";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Input, Button } from "@/Shared/Components/UIKitten";

type Props = {
  visible: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  debtor?: {
    id: number;
    name: string;
    description: string | null;
    phoneNumber: string | null;
  };
  onSuccess?: () => void;
};

export default function DebtorModal({
  visible,
  onClose,
  mode,
  debtor,
  onSuccess,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(""); 
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createDebtor] = useCreateDebtorMutation();
  const [updateDebtor] = useUpdateDebtorMutation();

  useEffect(() => {
    if (mode === "edit" && debtor) {
      setName(debtor.name);
      setDescription(debtor.description || "");
      setPhoneNumber(debtor.phoneNumber || "");
    } else {
      // Reset all on open for "add"
      setName("");
      setAmount("");
      setDescription("");
      setPhoneNumber("");
      setNote("");
    }
  }, [visible, mode, debtor]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Enter debtor name");
      return false;
    }

    if (mode === "add" && (!amount.trim() || isNaN(parseFloat(amount)))) {
      Alert.alert("Error", "Enter valid amount");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === "add") {
        await createDebtor({
          name,
          amountOwed: parseFloat(amount),
          phoneNumber: phoneNumber || "",
          description: description || "",
        }).unwrap();
        Alert.alert("Success", "Debtor added!");
      } else {
        await updateDebtor({
          id: debtor!.id,
          data: {
            name,
            phoneNumber: phoneNumber || "",
            description: description || "",
          },
        }).unwrap();
        Alert.alert("Success", "Debtor updated!");
      }

      onClose();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.detail || "Something went wrong");
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
            <Text style={styles.headerTitle}>
              {mode === "add" ? "Add Debtor" : "Edit Debtor"}
            </Text>
            <Button title="Close" onPress={onClose} size="small" />
          </View>

          <View style={styles.form}>
            <Input label="Name *" value={name} onChangeText={setName} />

            {mode === "add" && (
              <Input
                label="Amount *"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            )}

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {mode === "add" && (
              <Input
                label="Note"
                value={note}
                onChangeText={setNote}
                multiline
              />
            )}

            {mode === "edit" && (
              <View
                style={[
                  styles.amountInfo,
                  {
                    backgroundColor: color.background,
                    borderLeftColor: color.primary,
                  },
                ]}
              >
                <Text style={[styles.amountInfoText, { color: color.text }]}>
                  To update the amount owed, please record a payment or add debt from the debtor details screen.
                </Text>
              </View>
            )}

            <Button
              title={mode === "add" ? "Add Debtor" : "Save Changes"}
              onPress={handleSubmit}
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
  amountInfo: {
    borderRadius: 5,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
  },
  amountInfoText: {
    fontSize: 14,
  },
});
