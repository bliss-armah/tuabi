import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
  useGetDebtorQuery,
} from "@/Features/Debtors/DebtorsApi";
import { Colors } from "@/Shared/Constants/Colors";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtorSchema } from "./debtorSchema";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { skipToken } from "@reduxjs/toolkit/query";

type FormData = {
  name: string;
  amount?: string;
  phoneNumber: string;
  description?: string;
  note?: string;
};

// This page expects mode ('add' or 'edit') and optionally debtorId as params
export default function DebtorFormPage() {
  const { mode, debtorId } = useLocalSearchParams();
  const isEdit = mode === "edit" && debtorId;
  const { data: debtorData, isLoading: isDebtorLoading } = useGetDebtorQuery(
    isEdit ? Number(debtorId) : skipToken
  );
  const [createDebtor] = useCreateDebtorMutation();
  const [updateDebtor] = useUpdateDebtorMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
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
    if (isEdit && debtorData?.data) {
      reset({
        name: debtorData.data.name || "",
        phoneNumber: debtorData.data.phoneNumber || "",
        description: debtorData.data.description || "",
        note: "",
      });
    } else {
      reset();
    }
  }, [mode, debtorId, debtorData]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add") {
        await createDebtor({
          name: data.name,
          amountOwed: parseFloat(data.amount || "0"),
          phoneNumber: data.phoneNumber,
          description: data.description || "",
        }).unwrap();
        Alert.alert("Success", "Debtor added!", [
          { text: "OK", onPress: () => router.replace("/(tabs)/debtors") },
        ]);
      } else {
        await updateDebtor({
          id: Number(debtorId),
          data: {
            name: data.name,
            phoneNumber: data.phoneNumber,
            description: data.description || "",
          },
        }).unwrap();
        Alert.alert("Success", "Debtor updated!", [
          { text: "OK", onPress: () => router.replace("/(tabs)/debtors") },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.data?.detail || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <View style={{ flex: 1 }}>
        {isEdit && isDebtorLoading ? (
          <LoadingView text="Loading debtor..." />
        ) : (
          <>
            <ScrollView
              contentContainerStyle={[styles.scroll]}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                  {mode === "add" ? "Add Debtor" : "Edit Debtor"}
                </Text>
                <Text></Text>
              </View>
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="name"
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
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
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
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
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
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
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
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
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
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
                  <View style={[styles.amountInfo]}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={Colors.icon}
                    />

                    <Text
                      style={[styles.amountInfoText, { color: Colors.text }]}
                    >
                      Use this page to keep your personal details up to date.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <SafeAreaView style={styles.bottomButtonContainer}>
              <Button
                title={mode === "add" ? "Add" : "Save Changes"}
                disabled={!isValid || isSubmitting}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                variant="primary"
                style={styles.bottomButton}
              />
            </SafeAreaView>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 50,
  },
  headerTitle: {
    fontSize: 20,
    color: "#0a0a0a",
    fontWeight: "bold",
  },
  form: {
    borderRadius: 10,
  },
  amountInfo: {
    flexDirection: "row",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    padding: 10,
    gap: 10,
    marginTop: 15,
    borderRadius: 10,
  },

  amountInfoText: {
    fontSize: 14,
    width: "92%",
  },
  bottomButtonContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButton: {
    width: "100%",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
