import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { debtorService } from '../Shared/Api/api';

type Debtor = {
  id: number;
  name: string;
  amount_owed: number;
  description: string | null;
  phone_number: string | null;
};

export default function EditDebtor() {
  const { id } = useLocalSearchParams();
  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadDebtorDetails(Number(id));
    }
  }, [id]);

  const loadDebtorDetails = async (debtorId: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await debtorService.getDebtor(debtorId);
      setDebtor(response.data);
      setName(response.data.name || '');
      setDescription(response.data.description || '');
      setPhoneNumber(response.data.phone_number || '');
    } catch (err) {
      console.error('Error loading debtor details:', err);
      setError('Failed to load debtor details');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter the debtor name');
      return false;
    }
    return true;
  };

  const handleUpdateDebtor = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        description: description.trim() || null,
        phone_number: phoneNumber.trim() || null
      };

      await debtorService.updateDebtor(Number(id), updatedData);

      Alert.alert(
        'Success',
        'Debtor updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/debtor-detail',
              params: { id }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Error updating debtor:', error);
      Alert.alert('Error', 'Failed to update debtor');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading debtor details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadDebtorDetails(Number(id))}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Debtor</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter debtor name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.amountInfo}>
            <Text style={styles.amountInfoText}>
              Note: To update the amount owed, please record a payment or add debt from the debtor details screen.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateDebtor}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3498db',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  amountInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  amountInfoText: {
    color: '#34495e',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
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
});
