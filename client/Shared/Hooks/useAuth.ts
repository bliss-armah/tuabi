import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((data) => {
      setUser(data ? JSON.parse(data) : null);
    });
    AsyncStorage.getItem("access_token").then((token) => {
      setToken(token);
    });
  }, []);

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
  };

  return { user, token, logout };
};
