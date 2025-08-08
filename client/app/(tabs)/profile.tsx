import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { Colors } from "@/Shared/Constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Modal } from "@/Shared/Components/UIKitten";
import {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from "@/Features/Authentication/AuthAPI";

const Profile = () => {
  const { user, logout } = useAuth();
  const [requestReset] = useRequestPasswordResetMutation();
  const [resetPassword] = useResetPasswordMutation();

  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [identifier, setIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!identifier) {
      Alert.alert("Error", "Please enter your email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      await requestReset({ identifier }).unwrap();
      setResetStep("verify");
      Alert.alert(
        "Success",
        "Reset code sent! Check your email/SMS for the 6-digit code."
      );
    } catch (error: any) {
      Alert.alert("Error", error.data?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ identifier, resetCode, newPassword }).unwrap();
      Alert.alert("Success", "Password reset successfully!", [
        { text: "OK", onPress: () => setShowResetModal(false) },
      ]);
      setResetStep("request");
      setIdentifier("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowResetModal(false);
    setResetStep("request");
    setIdentifier("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={[styles.navbar, { backgroundColor: Colors.background }]}>
        <Text style={[styles.greeting, { color: Colors.gray }]}>
          Hi, {user?.name}
        </Text>
        <View style={styles.navbarIcons}>
          <Button
            onPress={() => setShowResetModal(true)}
            icon={
              <Ionicons name="key-outline" size={20} color={Colors.primary} />
            }
            style={styles.iconButton}
            textStyle={{ color: Colors.primary, fontSize: 12 }}
            title="Reset Password"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Debtors</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>₵0.00</Text>
            <Text style={styles.statLabel}>Total Debt</Text>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <Button
            title="Logout"
            onPress={logout}
            icon={
              <Ionicons
                name="log-out-outline"
                size={24}
                color={Colors.danger}
              />
            }
            style={styles.logoutButton}
            textStyle={{ color: Colors.danger }}
          />
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={showResetModal}
        onBackdropPress={resetModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {resetStep === "request"
              ? "Request Password Reset"
              : "Enter Reset Code"}
          </Text>

          {resetStep === "request" ? (
            <>
              <Text style={styles.modalSubtitle}>
                Enter your email or phone number to receive a reset code
              </Text>
              <Input
                placeholder="Email or Phone Number"
                value={identifier}
                onChangeText={setIdentifier}
                style={styles.modalInput}
                status="basic"
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={resetModal}
                  style={[styles.modalButton, styles.cancelButton]}
                  textStyle={{ color: Colors.muted }}
                />
                <Button
                  title="Send Code"
                  onPress={handleRequestReset}
                  loading={isLoading}
                  style={[styles.modalButton, styles.primaryButton]}
                  textStyle={{ color: Colors.white }}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.modalSubtitle}>
                Enter the 6-digit code sent to your email/phone
              </Text>
              <Input
                placeholder="6-digit code"
                value={resetCode}
                onChangeText={setResetCode}
                style={styles.modalInput}
                status="basic"
                keyboardType="numeric"
                maxLength={6}
              />
              <Input
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.modalInput}
                status="basic"
                secureTextEntry
              />
              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.modalInput}
                status="basic"
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Back"
                  onPress={() => setResetStep("request")}
                  style={[styles.modalButton, styles.cancelButton]}
                  textStyle={{ color: Colors.muted }}
                />
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={[styles.modalButton, styles.primaryButton]}
                  textStyle={{ color: Colors.white }}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
  },
  navbarIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.muted,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: Colors.muted,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    margin: 20,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
});

export default Profile;
