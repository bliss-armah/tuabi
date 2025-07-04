import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { useGetDebtorsQuery } from "@/Features/Debtors/DebtorsApi";
import { Button, SearchInput, Card } from "@/Shared/Components/UIKitten";
import AddDebtorModal from "@/Features/Debtors/DebtorModal";

type ColorType = {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  icon: string;
  border: string;
  card: string;
};

type Debtor = {
  id: number;
  name: string;
  amountOwed: number;
  description: string | null;
  phone_number: string | null;
};

export default function Debtors() {
  const colorScheme = useColorScheme();
  const color: ColorType = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [showAddModal, setShowAddModal] = useState(false);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading: debtorsLoading,
    error: debtorsError,
    refetch,
  } = useGetDebtorsQuery();

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
      const filtered = debtors.filter((debtor) =>
        debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDebtors(filtered);
    }
  }, [searchQuery, debtors]);

  const onRefresh = () => {
    refetch();
  };

  const styles = createStyles(color);

  const renderDebtorItem = ({ item }: { item: Debtor }) => (
    <Card
      onPress={() =>
        router.push({
          pathname: "/debtor-detail",
          params: { id: item.id },
        })
      }
      style={styles.debtorCard}
    >
      <View style={styles.debtorInfo}>
        <Text style={styles.debtorName}>{item.name}</Text>
        <Text style={styles.debtorDescription} numberOfLines={1}>
          {item.description || "No description"}
        </Text>
      </View>
      <View style={styles.debtorAmount}>
        <Text
          style={[
            styles.amountText,
            item.amountOwed > 0 ? styles.positiveAmount : styles.zeroAmount,
          ]}
        >
          GHS{Math.abs(item.amountOwed).toFixed(2)}
        </Text>
        <Text style={styles.statusText}>
          {item.amountOwed > 0 ? "Owes" : "Settled"}
        </Text>
      </View>
    </Card>
  );

  if (debtorsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>Loading debtors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Debtors</Text>
        {!searchQuery.length && (
          <Button
            title="➕ Add"
            onPress={() => setShowAddModal(true)}
            appearance="filled"
            status="primary"
            size="small"
            style={styles.addButton}
          />
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search debtors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          style={styles.searchInput}
        />
      </View>

      {debtorsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(debtorsError as any)?.data?.message}
          </Text>
          <Button
            title="Retry"
            onPress={refetch}
            status="primary"
            size="medium"
          />
        </View>
      ) : filteredDebtors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color={color.icon} />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0
              ? "No debtors match your search"
              : "No debtors yet. Add your first one!"}
          </Text>
          {searchQuery.length === 0 && (
            <Button
              title="Add Debtor"
              onPress={() => setShowAddModal(true)}
              status="primary"
              size="medium"
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDebtors}
          renderItem={renderDebtorItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={debtorsLoading} onRefresh={onRefresh} />
          }
        />
      )}

      <AddDebtorModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
}

const createStyles = (color: ColorType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      backgroundColor: color.primary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: color.background,
    },
    addButton: {
      backgroundColor: color.accent,
    },
    searchContainer: {
      marginHorizontal: 15,
      marginTop: -15,
      marginBottom: 10,
    },
    searchInput: {
      shadowColor: color.background,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    debtorCard: {
      flexDirection: "row",
      shadowColor: color.background,
    },
    debtorInfo: {
      flex: 1,
    },
    debtorName: {
      fontSize: 16,
      fontWeight: "bold",
      color: color.text,
    },
    debtorDescription: {
      fontSize: 14,
      color: color.icon,
      marginTop: 5,
    },
    debtorAmount: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
    amountText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    positiveAmount: {
      color: color.accent,
    },
    zeroAmount: {
      color: color.primary,
    },
    statusText: {
      fontSize: 12,
      color: color.icon,
      marginTop: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      color: color.icon,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      color: color.accent,
      fontSize: 16,
      marginBottom: 20,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: color.icon,
      textAlign: "center",
      marginTop: 15,
      marginBottom: 20,
    },
  });
