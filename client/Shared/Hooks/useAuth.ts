import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loading state

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


  // auto logout if token is expired
  useEffect(() => {
    if (!tokenExpiry) return;

    const now = Date.now();
    const delay = tokenExpiry * 1000 - now;

    if (delay <= 0) {
      logout(); // already expired
    } else {
      const timeout = setTimeout(logout, delay);
      return () => clearTimeout(timeout);
    }
  }, [tokenExpiry]);

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    setTokenExpiry(null);
    router.replace("/login");
  };

  return { user, token, logout, loading };
};
