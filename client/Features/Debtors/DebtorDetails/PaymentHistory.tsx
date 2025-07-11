import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { DebtHistory } from "@/Features/Debtors/DebtorsApi";

interface PaymentHistoryProps {
  history?: DebtHistory[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <View style={[styles.historyContainer, { backgroundColor: Colors.card }]}>
      <Text style={[styles.historyTitle, { color: Colors.text }]}>
        Payment History
      </Text>

      {history?.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="time" size={40} color="#bdc3c7" />
          <Text style={styles.emptyHistoryText}>No payment history yet</Text>
        </View>
      ) : (
        <ScrollView
          style={{ maxHeight: 350 }}
          showsVerticalScrollIndicator={false}
        >
          {history?.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyRow}>
                <Ionicons
                  name={item.action === "add" ? "add-circle" : "remove-circle"}
                  size={20}
                  color={item.action === "add" ? Colors.accent : Colors.primary}
                />
                <View style={{flex:1}}>
                  <View style={styles.historyRowTitle}>
                    <Text style={styles.historyAction}>
                      {item.action === "add"
                        ? "Debt Added"
                        : item.action === "reduce"
                        ? "Payment Received"
                        : "Settled"}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.historyAmount,
                        {
                          color:
                            item.action === "add"
                              ? Colors.accent
                              : Colors.primary,
                        },
                      ]}
                    >
                      {item.action === "add" ? "+" : "-"}GHS{" "}
                      {Math.abs(item.amountChanged).toFixed(2)}
                    </Text>

                    {item.note && (
                      <Text style={styles.historyNote}>{item.note}</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
  historyRow: {
    flexDirection: "row",
    columnGap: 15,
  },
  historyRowTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width:"100%",
  },
  historyAction: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
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
  },
});
