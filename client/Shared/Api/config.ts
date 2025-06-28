import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://192.168.3.78:8000",
  prepareHeaders: async (headers) => {
    const tokenString = await AsyncStorage.getItem("token");
    const tokenObj = tokenString ? JSON.parse(tokenString) : null;
    const token = tokenObj?.access_token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const userString = await AsyncStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (result.error) {
    const errorDetails = {
      status: result.error.status,
      data: result.error.data,
      args,
      timestamp: new Date().toISOString(),
      user: user || "Anonymous",
      path: args.url,
    };
    console.error("API Error:", errorDetails);
  }

  return result;
};

export default baseQuery;
