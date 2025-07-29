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
import { SearchInput } from "@/Shared/Components/UIKitten";
import { ErrorView } from "@/Shared/Components/ErrorView";
import { LoadingView } from "@/Shared/Components/LoadingView";
import { DebtorHeader } from "@/Features/Debtors/DebtorHeader";
import { Button } from "@/Shared/Components/UIKitten";

type Debtor = {
  id: number;
  name: string;
  amountOwed: number;
};

export default function Debtors() {
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <DebtorHeader
        title="Debtors"
        actionButton={
          <Ionicons name="add-circle-outline" size={28} color={Colors.white} />
        }
        onTap={() => router.push("/add-debtor?mode=add")}
      />
      <View style={styles.container}>
        {filteredDebtors.length > 0 && (
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          </View>
        )}

        {filteredDebtors.length ? (
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
            <Button
              title="Add Debtor"
              onPress={() => router.push("/add-debtor?mode=add")}
              variant="primary"
              style={styles.addButton}
            />
          </View>
        )}
      </View>
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
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.white,
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
});
