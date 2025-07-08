import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const tokenString = await AsyncStorage.getItem("token");

        if (userString) {
          setUser(JSON.parse(userString));
        }

        if (tokenString) {
          const parsed = JSON.parse(tokenString);
          setToken(parsed.access_token);
          setTokenExpiry(parsed.expires_in);
        }
      } catch (err) {
        console.error("Failed to load auth data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  useEffect(() => {
    if (!tokenExpiry) return;
    
    const delay = tokenExpiry * 1000;
    const timeout = setTimeout(logout, delay);
    
    if (delay <= 0) {
    } else {
      logout();
      return () => clearTimeout(timeout);
    }
  }, [tokenExpiry]);

  const logout = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    } finally {
      setUser(null);
      setToken(null);
      setTokenExpiry(null);
      router.replace("/login");
    }
  };

  return { user, token, logout, loading };
};
