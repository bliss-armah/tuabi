import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

 useEffect(() => {
   AsyncStorage.getItem("user").then((data) => {
     setUser(data ? JSON.parse(data) : null);
   });

   AsyncStorage.getItem("token").then((data) => {
     if (data) {
       const parsed = JSON.parse(data);
       setToken(parsed.access_token);
       setTokenExpiry(parsed.expires_in);
     }
   });
 }, []);


  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    setTokenExpiry(null);
    router.replace("/");
  };

  return { user, token, logout };
};
