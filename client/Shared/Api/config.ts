import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createBaseQuery = (token: string | null, printerId: string | null) => {
  return fetchBaseQuery({
    baseUrl: 'http://192.168.0.139:8000',// Also note: make sure to use http:// and not /localhost
    prepareHeaders: headers => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (printerId) {
        headers.set('X-Printer-ID', printerId);
      }
      return headers;
    },
  });
};

const logErrorLocally = (errorDetails: any) => {
  console.error('API Error:', errorDetails);
};

const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const token = await AsyncStorage.getItem('token');
  const tokenExpiryStr = await AsyncStorage.getItem('tokenExpiry');
  const user = await AsyncStorage.getItem('user');
  const printerId = await AsyncStorage.getItem('selectedPrinter');

  const tokenExpiry = parseInt(tokenExpiryStr ?? '0');

  if (tokenExpiry && Date.now() >= tokenExpiry) {
    await AsyncStorage.clear();
    // You can't use window.location in React Native, navigate programmatically
    return { error: { status: 401, data: 'Token expired' } };
  }

  const baseQueryFunction = createBaseQuery(token, printerId);
  const result = await baseQueryFunction(args, api, extraOptions);

  if (result.error) {
    const errorDetails = {
      status: result.error.status,
      data: result.error.data,
      args,
      timestamp: new Date().toISOString(),
      user: user ? user : 'Anonymous',
      path: args.url,
    };

    logErrorLocally(errorDetails);
  }

  return result;
};

export default baseQuery;
