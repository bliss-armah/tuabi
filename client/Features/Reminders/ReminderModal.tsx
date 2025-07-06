import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Input, Button } from "@/Shared/Components/UIKitten";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import {
  useCreateReminderMutation,
  useUpdateReminderMutation,
} from "./RemindersApi";
import { Reminder } from "./RemindersApi";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
});

type FormData = z.infer<typeof reminderSchema>;

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  reminder?: Reminder;
  debtorId?: number;
  debtorName?: string;
  onSuccess?: () => void;
}

export default function ReminderModal({
  visible,
  onClose,
  mode,
  reminder,
  debtorId,
  debtorName,
  onSuccess,
}: ReminderModalProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [createReminder] = useCreateReminderMutation();
  const [updateReminder] = useUpdateReminderMutation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(reminderSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      message: "",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
    },
  });

  const watchedDueDate = watch("dueDate");

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && reminder) {
        reset({
          title: reminder.title,
          message: reminder.message,
          dueDate: new Date(reminder.dueDate),
        });
      } else {
        reset({
          title: "",
          message: "",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }
    }
  }, [visible, mode, reminder, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add" && debtorId) {
        await createReminder({
          debtorId,
          title: data.title,
          message: data.message,
          dueDate: data.dueDate.toISOString(),
        }).unwrap();
        Alert.alert("Success", "Reminder created successfully!");
      } else if (mode === "edit" && reminder) {
        await updateReminder({
          id: reminder.id,
          data: {
            title: data.title,
            message: data.message,
            dueDate: data.dueDate.toISOString(),
          },
        }).unwrap();
        Alert.alert("Success", "Reminder updated successfully!");
      }

      onClose();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Something went wrong");
    }
  };

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setValue("dueDate", selectedDate);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.text }]}>
              {mode === "add" ? "Create Reminder" : "Edit Reminder"}
            </Text>
            {debtorName && (
              <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
                For: {debtorName}
              </Text>
            )}
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Reminder Title"
                  placeholder="e.g., Payment Due"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  status={errors.title ? "danger" : "basic"}
                  caption={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Message"
                  placeholder="Enter reminder message..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  status={errors.message ? "danger" : "basic"}
                  caption={errors.message?.message}
                />
              )}
            />

            <View style={styles.dateContainer}>
              <Text style={[styles.dateLabel, { color: Colors.text }]}>
                Due Date & Time
              </Text>
              <Button
                title={formatDate(watchedDueDate)}
                onPress={() => setShowDatePicker(true)}
                appearance="outline"
                status="basic"
                size="medium"
                style={styles.dateButton}
              />
              {errors.dueDate && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.dueDate.message}
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={watchedDueDate}
                mode="datetime"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.buttons}>
              <Button
                title="Cancel"
                onPress={onClose}
                appearance="outline"
                status="basic"
                size="medium"
                style={styles.cancelButton}
              />
              <Button
                title={mode === "add" ? "Create" : "Update"}
                disabled={!isValid || isSubmitting}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                status="primary"
                size="medium"
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  dateContainer: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  dateButton: {
    alignSelf: "flex-start",
  },
  errorText: {
    fontSize: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
