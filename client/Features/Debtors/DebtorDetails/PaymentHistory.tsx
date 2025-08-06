import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { DebtHistory } from "@/Features/Debtors/DebtorsApi";

interface PaymentHistoryProps {
  history?: DebtHistory[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isExpanded = (itemId: number) => expandedItems.has(itemId);

  return (
    <View style={[styles.historyContainer, { backgroundColor: Colors.card }]}>
      <Text style={[styles.historyTitle, { color: Colors.text }]}>
        Payment History
      </Text>

      {!history || history.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="time" size={40} color={Colors.textSecondary} />
          <Text
            style={[styles.emptyHistoryText, { color: Colors.textSecondary }]}
          >
            No payment history yet
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => toggleExpanded(item.id)}
              activeOpacity={0.7}
            >
              {/* Main Row - Always Visible */}
              <View style={styles.mainRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={
                      item.action === "add" ? "add-circle" : "remove-circle"
                    }
                    size={24}
                    color={item.action === "add" ? "#e74c3c" : "#27ae60"}
                  />
                </View>

                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: item.action === "add" ? "#e74c3c" : "#27ae60",
                      },
                    ]}
                  >
                    GHS {item.amountChanged.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.expandContainer}>
                  <Ionicons
                    name={isExpanded(item.id) ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              </View>

              {/* Expanded Details */}
              {isExpanded(item.id) && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      Date:
                    </Text>
                    <Text style={[styles.detailValue, { color: Colors.text }]}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      Type:
                    </Text>
                    <Text style={[styles.detailValue, { color: Colors.text }]}>
                      {item.action === "add"
                        ? "Debt Added"
                        : "Payment Received"}
                    </Text>
                  </View>

                  {item.note && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: Colors.textSecondary },
                        ]}
                      >
                        Note:
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: Colors.text }]}
                      >
                        {item.note}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
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
  historyList: {
    gap: 8,
    maxHeight: 200,
  },
  historyItem: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 5,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  amountContainer: {
    flex: 1,
    alignItems: "center",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  expandContainer: {
    width: 40,
    alignItems: "center",
  },
  expandedDetails: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "normal",
    flex: 1,
    textAlign: "right",
  },
});
