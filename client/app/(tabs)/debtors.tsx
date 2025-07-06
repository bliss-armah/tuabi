import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useGetDebtorsQuery } from "@/Features/Debtors/DebtorsApi";
import DebtorModal from "@/Features/Debtors/DebtorModal";
import { SearchInput } from "@/Shared/Components/UIKitten";
import { ErrorView } from "@/Shared/Components/ErrorView";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { DebtorHeader } from "@/Features/Debtors/DebtorHeader";
import { useDebtorModal } from "@/Shared/Hooks/useDebtorModal";

type Debtor = {
  id: number;
  name: string;
  amountOwed: number;
};

export default function Debtors() {
  const { isVisible, mode, openAddDebtor, closeModal } = useDebtorModal();

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
                color: item.amountOwed > 0 ? Colors.accent : Colors.primary,
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <DebtorHeader
        title="Debtors"
        actionButton={
          filteredDebtors.length && (
            <Ionicons name="add-circle-outline" size={28} color={"#ffffff"} />
          )
        }
        onTap={openAddDebtor}
      />
      <View style={styles.container}>
        {filteredDebtors.length && (
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          </View>
        )}

        {filteredDebtors.length > 0 ? (
          <FlatList
            data={filteredDebtors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No debtors yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding someone who owes you.
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddDebtor}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Debtor</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DebtorModal
        visible={isVisible}
        mode={mode}
        onClose={closeModal}
        onSuccess={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingBottom: 10,
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
    backgroundColor: "#dfe6e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  status: {
    fontSize: 12,
    color: "#636e72",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
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
    color: "#2d3436",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#636e72",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
});
