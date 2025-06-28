import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { debtorService } from "../Shared/Api/api";
import {
  useGetDebtorQuery,
  useUpdateDebtorMutation,
} from "@/Features/Debtors/DebtorsApi";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { Colors } from "@/Shared/Constants/Colors";

type Debtor = {
  id: number;
  name: string;
  amount_owed: number;
  description: string | null;
  phone_number: string | null;
};

export default function EditDebtor() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const {
    data: debtor,
    isLoading,
    error,
    refetch,
  } = useGetDebtorQuery(Number(id));
  const [updateDebtor] = useUpdateDebtorMutation();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  useEffect(() => {
    if (debtor) {
      setName(debtor.name);
      setDescription(debtor.description || "");
      setPhoneNumber(debtor.phone_number || "");
    }
  }, [debtor]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter the debtor name");
      return false;
    }
    return true;
  };

  const handleUpdateDebtor = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        description: description.trim() || null,
        phone_number: phoneNumber.trim() || null,
      };

      await updateDebtor({ id: Number(id), data: updatedData });

      Alert.alert("Success", "Debtor updated successfully", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/debtor-detail",
              params: { id },
            }),
        },
      ]);
    } catch (error) {
      console.error("Error updating debtor:", error);
      Alert.alert("Error", "Failed to update debtor");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
        <Text style={[styles.errorText, { color: Colors[theme].text }]}>
          {error?.data?.message}
        </Text>
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        <View
          style={[styles.header, { backgroundColor: Colors[theme].primary }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Debtor</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={[
            styles.formContainer,
            { backgroundColor: Colors[theme].card },
          ]}
        >
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>
              Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].border,
                  color: Colors[theme].text,
                },
              ]}
              placeholder="Enter debtor name"
              placeholderTextColor={Colors[theme].icon}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>
              Phone Number (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].border,
                  color: Colors[theme].text,
                },
              ]}
              placeholder="Enter phone number"
              placeholderTextColor={Colors[theme].icon}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors[theme].text }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: Colors[theme].border,
                  color: Colors[theme].text,
                },
              ]}
              placeholder="Enter description"
              placeholderTextColor={Colors[theme].icon}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View
            style={[
              styles.amountInfo,
              {
                backgroundColor: Colors[theme].background,
                borderLeftColor: Colors[theme].primary,
              },
            ]}
          >
            <Text
              style={[styles.amountInfoText, { color: Colors[theme].text }]}
            >
              Note: To update the amount owed, please record a payment or add
              debt from the debtor details screen.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: Colors[theme].primary },
            ]}
            onPress={handleUpdateDebtor}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  formContainer: {
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  amountInfo: {
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  amountInfoText: {
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 5,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
