import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useGetDebtorsQuery } from "@/Features/Debtors/DebtorsApi";
import { SearchInput } from "@/Shared/Components/UIKitten";
import { ErrorView } from "@/Shared/Components/ErrorView";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { Button } from "@/Shared/Components/UIKitten";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";

type Debtor = {
  id: number;
  name: string;
  amountOwed: number;
};

export default function Debtors() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useGetDebtorsQuery();

  useEffect(() => {
    if (data?.data) {
      setDebtors(data.data);
      setFilteredDebtors(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDebtors(debtors);
    } else {
      setFilteredDebtors(
        debtors.filter((debtor) =>
          debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, debtors]);

  const onRefresh = () => {
    refetch();
  };

  const renderItem = ({ item }: { item: Debtor }) => {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          router.push({ pathname: "/debtor-detail", params: { id: item.id } })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status}>
            {item.amountOwed > 0 ? "Owes" : "Settled"}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.amount,
              {
                color: item.amountOwed > 0 ? Colors.text : Colors.secondary,
              },
            ]}
          >
            GHS{" "}
            {Math.abs(item.amountOwed).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingView text="Loading debtors..." />;
  }

  if (error) {
    return (
      <ErrorView
        error={(error as any)?.data?.message || "Something went wrong"}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>My Debtors</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(filteredDebtors.length > 0 || searchQuery.trim() !== "") && (
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search debtors"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          </View>
        )}

        {filteredDebtors.length ? (
          <View style={styles.listContainer}>
            {filteredDebtors.map((item) => (
              <View key={item.id}>
                {renderItem({ item })}
                <View style={styles.separator} />
              </View>
            ))}
          </View>
        ) : searchQuery.trim() !== "" ? (
          // Show "no search results" when searching
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: Colors.text }]}>
              No debtors found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: Colors.textSecondary }]}
            >
              No debtors match "{searchQuery}"
            </Text>
          </View>
        ) : (
          // Show "no debtors yet" when there are no debtors at all
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: Colors.text }]}>
              No debtors yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: Colors.textSecondary }]}
            >
              Tap the + button to add your first debtor.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - Always visible */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={() => router.push("/add-debtor?mode=add")}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    paddingBottom: 20,
  },
  listContainer: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
    color: Colors.text,
  },
  status: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 60,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  fab: {
    position: "absolute",
    bottom: 100, // Account for tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  clearSearchButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearSearchText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
