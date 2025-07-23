import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router";

/**
 * Base query configuration for RTK Query
 * Handles authentication headers and 401 error responses
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "https://01e57bd47563.ngrok-free.app/api",
  // baseUrl: "http://192.168.0.174:3500/api",
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

/**
 * Safely clear AsyncStorage by removing specific keys
 * This avoids the iOS directory deletion error that occurs with clear()
 */
const performLogout = async () => {
  try {
    // Define all the keys your app uses
    const keysToRemove = [
      "token",
      "user",
      "refreshToken",
      // Add any other keys your app stores
    ];

    // Method 1: Remove specific keys (safer)
    await AsyncStorage.multiRemove(keysToRemove);

    // Method 2: Alternative - get all keys and remove them
    // const allKeys = await AsyncStorage.getAllKeys();
    // if (allKeys.length > 0) {
    //   await AsyncStorage.multiRemove(allKeys);
    // }

    console.log("AsyncStorage cleared successfully");
  } catch (error) {
    console.error("Error clearing storage during logout:", error);

    // Fallback: try to remove keys individually
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("refreshToken");
      console.log("Fallback key removal completed");
    } catch (fallbackError) {
      console.error("Fallback key removal also failed:", fallbackError);
    }
  } finally {
    router.replace("/login");
  }
};

const isAuthEndpoint = (url: string): boolean => {
  if (url === "/" || url === "") return true;

  const authPaths = ["/auth", "/register", "/password", "/reset", "/refresh"];

  return authPaths.some(
    (path) =>
      url === path || url.startsWith(path + "/") || url.startsWith(path + "?")
  );
};
