import React, { useEffect } from "react";
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
import {
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
} from "@/Features/Debtors/DebtorsApi";
import { Colors } from "@/Shared/Constants/Colors";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtorSchema } from "./debtorSchema";

type FormData = {
  name: string;
  amount?: string;
  phoneNumber: string;
  description?: string;
  note?: string;
};

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
  const [createDebtor] = useCreateDebtorMutation();
  const [updateDebtor] = useUpdateDebtorMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(debtorSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      amount: "",
      phoneNumber: "",
      description: "",
      note: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && debtor) {
      reset({
        name: debtor.name,
        phoneNumber: debtor.phoneNumber || "",
        description: debtor.description || "",
        note: "",
      });
    } else {
      reset();
    }
  }, [visible, mode, debtor]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add") {
        await createDebtor({
          name: data.name,
          amountOwed: parseFloat(data.amount || "0"),
          phoneNumber: data.phoneNumber,
          description: data.description || "",
        }).unwrap();
        Alert.alert("Success", "Debtor added!");
      } else {
        await updateDebtor({
          id: debtor!.id,
          data: {
            name: data.name,
            phoneNumber: data.phoneNumber,
            description: data.description || "",
          },
        }).unwrap();
        Alert.alert("Success", "Debtor updated!");
      }

      onClose();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.detail || "Something went wrong");
    }
  };

  const amount = watch("amount");

  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === "add" ? "Add Debtor" : "Edit Debtor"}
            </Text>
            <Ionicons name="close" size={26} color={Colors.primary} onPress={onClose} />
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Name *"
                  value={value}
                  onChangeText={onChange}
                  status={error ? "danger" : "basic"}
                  caption={error?.message}
                />
              )}
            />

            {mode === "add" && (
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Amount *"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    status={error ? "danger" : "basic"}
                    caption={error?.message}
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  status={error ? "danger" : "basic"}
                  caption={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  status={error ? "danger" : "basic"}
                  caption={error?.message}
                />
              )}
            />

            {mode === "add" && (
              <Controller
                control={control}
                name="note"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Note"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    status={error ? "danger" : "basic"}
                    caption={error?.message}
                  />
                )}
              />
            )}

            {mode === "edit" && (
              <View
                style={[
                  styles.amountInfo,
                  {
                    backgroundColor: Colors.background,
                    borderLeftColor: Colors.primary,
                  },
                ]}
              >
                <Text style={[styles.amountInfoText, { color: Colors.text }]}>
                  To update the amount owed, please record a payment or add debt from the
                  debtor details screen.
                </Text>
              </View>
            )}

            <Button
              title={mode === "add" ? "Add" : "Save Changes"}
              disabled={!isValid || isSubmitting}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
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
    color: "#0a0a0a",
    fontWeight: "bold",
  },
  form: {
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
