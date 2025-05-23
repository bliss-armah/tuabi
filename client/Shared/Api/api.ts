import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL
const API_URL = 'http://192.168.0.139:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('access_token');
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    return api.post('/user/', { name, email, password });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
  },
  
  getCurrentUser: async () => {
    return api.get('/user/me');
  },
};

// Debtor services
export const debtorService = {
  getDebtors: async () => {
    return api.get('/debtors/');
  },
  
  getDebtor: async (id: number) => {
    return api.get(`/debtors/${id}`);
  },
  
  createDebtor: async (debtor: any) => {
    return api.post('/debtors/', debtor);
  },
  
  updateDebtor: async (id: number, debtor: any) => {
    return api.put(`/debtors/${id}`, debtor);
  },
  
  deleteDebtor: async (id: number) => {
    return api.delete(`/debtors/${id}`);
  },
  
  getDebtorHistory: async (id: number) => {
    return api.get(`/debt-history/${id}`);
  },
  
  addPayment: async (id: number, payment: any) => {
    return api.post(`/debt-history/${id}`, payment);
  },
  
  getDashboardSummary: async () => {
    // This could be a custom endpoint that returns summary data
    const debtors = await api.get('/debtors/');
    const totalDebtors = debtors.data.length;
    const totalDebt = debtors.data.reduce((sum: number, debtor: any) => sum + debtor.amount_owed, 0);
    
    // Count recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let recentActivities = 0;
    for (const debtor of debtors.data) {
      if (debtor.updated_at && new Date(debtor.updated_at) >= sevenDaysAgo) {
        recentActivities++;
      }
    }
    
    return {
      totalDebtors,
      totalDebt,
      recentActivities
    };
  }
};

export default api;
