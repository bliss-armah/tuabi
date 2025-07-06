import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router";

/**
 * Base query configuration for RTK Query
 * Handles authentication headers and 401 error responses
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://192.168.0.164:3000/api",
  prepareHeaders: async (headers) => {
    const tokenString = await AsyncStorage.getItem("token");
    const token = tokenString ? JSON.parse(tokenString) : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

/**
 * Enhanced base query that handles 401 Unauthorized responses
 *
 * When a 401 response is received from any endpoint except auth endpoints:
 * 1. Shows a user-friendly alert about session expiration
 * 2. Automatically logs out the user
 * 3. Clears all stored data and cache
 * 4. Navigates to the login screen
 *
 * Auth endpoints (login, register, password reset, etc.) are excluded
 * from this behavior to prevent logout loops during authentication.
 */
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

    if (result.error.status === 401) {
      const url = args.url || "";

      if (!isAuthEndpoint(url)) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: performLogout,
            },
          ]
        );

        return {
          error: {
            status: 401,
            data: { message: "Session expired. Please login again." },
          },
        };
      }
    }
  }

  return result;
};

export default baseQuery;

const performLogout = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing storage during logout:", error);
  } finally {
    router.replace("/login");
  }
};

const isAuthEndpoint = (url: string): boolean => {
  const authPaths = [
    "/auth",
    "/login",
    "/register",
    "/password",
    "/reset",
    "/refresh",
  ];
  return authPaths.some(
    (path) => url.startsWith(path) || url.includes(`${path}/`)
  );
};
