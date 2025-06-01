import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { debtorService } from '../../Shared/Api/api';
import { Colors } from '@/Shared/Constants/Colors';
import { useColorScheme } from '@/Shared/Hooks/useColorScheme';
import { useGetDebtorsQuery } from '@/Features/Debtors/DebtorsApi';

type ColorScheme = 'light' | 'dark';
type ColorType = typeof Colors[ColorScheme];

type Debtor = {
  id: number;
  name: string;
  amount_owed: number;
  description: string;
  phone_number: string | null;
  created_at: string;
  updated_at: string | null;
};
const colorScheme = useColorScheme();
const color: ColorType = colorScheme === 'dark' ? Colors.dark : Colors.light;

export default function Debtors() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading: debtorsLoading, error: debtorsError, refetch } =
    useGetDebtorsQuery();

  useEffect(() => {
    if (data) {
      setDebtors(data);
      setFilteredDebtors(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDebtors(debtors);
    } else {
      const filtered = debtors.filter(debtor => 
        debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDebtors(filtered);
    }
  }, [searchQuery, debtors]);



  const onRefresh = () => {
    refetch();
  };

  const renderDebtorItem = ({ item }: { item: Debtor }) => (
    <TouchableOpacity 
      style={styles.debtorCard}
      onPress={() => router.push({
        pathname: '/debtor-detail',
        params: { id: item.id }
      })}
    >
      <View style={styles.debtorInfo}>
        <Text style={styles.debtorName}>{item.name}</Text>
        <Text style={styles.debtorDescription} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
      </View>
      <View style={styles.debtorAmount}>
        <Text 
          style={[
            styles.amountText, 
            item.amount_owed > 0 ? styles.positiveAmount : styles.zeroAmount
          ]}
        >
          ${Math.abs(item.amount_owed).toFixed(2)}
        </Text>
        <Text style={styles.statusText}>
          {item.amount_owed > 0 ? 'Owes' : 'Settled'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (debtorsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading debtors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Debtors</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push({
            pathname: '/(tabs)/add-debtor'
          })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search debtors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {debtorsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{debtorsError?.data?.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDebtors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0 
              ? 'No debtors match your search' 
              : 'No debtors yet. Add your first one!'}
          </Text>
          {searchQuery.length === 0 && (
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => router.push({
                pathname: '/(tabs)/add-debtor'
              })}
            >
              <Text style={styles.addFirstButtonText}>Add Debtor</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDebtors}
          renderItem={renderDebtorItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={debtorsLoading} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: color.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.background,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.card,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: -15,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: color.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: color.text,
  },
  listContainer: {
    padding: 15,
  },
  debtorCard: {
    flexDirection: 'row',
    backgroundColor: color.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: color.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  debtorInfo: {
    flex: 1,
  },
  debtorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.text,
  },
  debtorDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  debtorAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#e74c3c',
  },
  zeroAmount: {
    color: '#2ecc71',
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
