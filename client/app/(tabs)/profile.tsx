import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { Colors } from "@/Shared/Constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/Shared/Components/UIKitten";

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <Button 
          title="Logout"
          onPress={logout}
          variant="secondary"
          icon={<Ionicons name="log-out-outline" size={24} color={Colors.danger} />}
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
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
    color: Colors.gray,
    marginBottom: 32,
  },
  optionsContainer: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 12,
  },
});

export default Profile;
