import LandingScreen from "@/Features/LandingScreen.tsx/LandingScreen";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";

const index = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  return <LandingScreen />;
};

export default index;
