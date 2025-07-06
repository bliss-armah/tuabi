import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useGetRemindersQuery,
  useDeleteReminderMutation,
  useMarkReminderAsCompletedMutation,
  Reminder,
} from "./RemindersApi";
import ReminderModal from "./ReminderModal";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { ErrorView } from "@/Shared/Components/ErrorView";

interface RemindersListProps {
  debtorId?: number;
  debtorName?: string;
}

export default function RemindersList({
  debtorId,
  debtorName,
}: RemindersListProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<
    Reminder | undefined
  >();

  const {
    data: remindersResponse,
    isLoading,
    error,
    refetch,
  } = useGetRemindersQuery({ debtorId, status: "active" });

  const [deleteReminder] = useDeleteReminderMutation();
  const [markAsCompleted] = useMarkReminderAsCompletedMutation();

  const reminders = remindersResponse?.data || [];

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setModalVisible(true);
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReminder(reminder.id).unwrap();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.data?.message || "Failed to delete reminder"
              );
            }
          },
        },
      ]
    );
  };

  const handleMarkAsCompleted = async (reminder: Reminder) => {
    try {
      await markAsCompleted(reminder.id).unwrap();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to mark reminder as completed"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const getStatusColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return Colors.error;
    } else if (diffDays <= 1) {
      return Colors.warning;
    } else {
      return Colors.success;
    }
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View
      style={[styles.reminderItem, { backgroundColor: Colors.cardBackground }]}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderTitle, { color: Colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={[styles.reminderMessage, { color: Colors.textSecondary }]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.reminderDate,
              { color: getStatusColor(item.dueDate) },
            ]}
          >
            {formatDate(item.dueDate)}
          </Text>
          {!debtorId && (
            <Text style={[styles.debtorName, { color: Colors.textSecondary }]}>
              Debtor: {item.debtor.name}
            </Text>
          )}
        </View>
        <View style={styles.reminderActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleMarkAsCompleted(item)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.accent }]}
            onPress={() => handleEditReminder(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.error }]}
            onPress={() => handleDeleteReminder(item)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="notifications-off"
        size={48}
        color={Colors.textSecondary}
      />
      <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>
        No reminders yet
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: Colors.textSecondary }]}>
        Create a reminder to get notified about payments
      </Text>
    </View>
  );

  if (isLoading) {
    return <LoadingView text="Loading reminders..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>
          Reminders {debtorName && `for ${debtorName}`}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={() => {
            setEditingReminder(undefined);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <ReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mode={editingReminder ? "edit" : "add"}
        reminder={editingReminder}
        debtorId={debtorId}
        debtorName={debtorName}
        onSuccess={refetch}
      />
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
    gap: 12,
  },
  reminderItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  reminderDate: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  debtorName: {
    fontSize: 12,
    fontStyle: "italic",
  },
  reminderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
