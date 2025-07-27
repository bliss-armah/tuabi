import { useAuth } from "@/Shared/Hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  }, [user]);

  return null;
};

export default Index;
