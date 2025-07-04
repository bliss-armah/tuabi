import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { DebtHistory } from "@/Features/Debtors/DebtorsApi";

interface PaymentHistoryProps {
  theme: keyof typeof Colors;
  history?: DebtHistory[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  theme,
  history,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <View
      style={[styles.historyContainer, { backgroundColor: Colors[theme].card }]}
    >
      <Text style={[styles.historyTitle, { color: Colors[theme].text }]}>
        Payment History
      </Text>

      {history?.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="time" size={40} color="#bdc3c7" />
          <Text style={styles.emptyHistoryText}>No payment history yet</Text>
        </View>
      ) : (
        history?.map((item: DebtHistory) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <View style={styles.historyLeft}>
                <Ionicons
                  name={item.action === "add" ? "add-circle" : "remove-circle"}
                  size={20}
                  color={
                    item.action === "add"
                      ? Colors[theme].accent
                      : Colors[theme].primary
                  }
                />
                <Text style={styles.historyAction}>
                  {item.action === "add"
                    ? "Debt Added"
                    : item.action === "reduce"
                    ? "Payment Received"
                    : "Settled"}
                </Text>
              </View>
              <Text style={styles.historyDate}>
                {formatDate(item.timestamp)}
              </Text>
            </View>

            <Text
              style={[
                styles.historyAmount,
                {
                  color:
                    item.action === "add"
                      ? Colors[theme].accent
                      : Colors[theme].primary,
                },
              ]}
            >
              {item.action === "add" ? "+" : "-"}GHS{" "}
              {Math.abs(item.amountChanged).toFixed(2)}
            </Text>

            {item.note && <Text style={styles.historyNote}>{item.note}</Text>}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 10,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 15,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyAction: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 10,
  },
  historyDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  historyNote: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
});
