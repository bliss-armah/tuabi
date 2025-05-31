import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const createBaseQuery = (token: string | null) => {
  return fetchBaseQuery({
    baseUrl: "http://192.168.0.163:8000",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
};

const logErrorLocally = (errorDetails: any) => {
  console.error("API Error:", errorDetails);
};

const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const token = await AsyncStorage.getItem("token");
  const tokenExpiryStr = await AsyncStorage.getItem("tokenExpiry");
  const user = await AsyncStorage.getItem("user");

  const tokenExpiry = parseInt(tokenExpiryStr ?? "0");

  if (tokenExpiry && Date.now() >= tokenExpiry) {
    await AsyncStorage.clear();
    return { error: { status: 401, data: "Token expired" } };
  }

  const baseQueryFunction = createBaseQuery(token);
  const result = await baseQueryFunction(args, api, extraOptions);

  if (result.error) {
    const errorDetails = {
      status: result.error.status,
      data: result.error.data,
      args,
      timestamp: new Date().toISOString(),
      user: user ? user : "Anonymous",
      path: args.url,
    };

    logErrorLocally(errorDetails);
  }

  return result;
};

export default baseQuery;
