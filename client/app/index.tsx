import LandingScreen from "@/Features/LandingScreen.tsx/LandingScreen";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";

const index = () => {
  const { user } = useAuth();

  if (user) {
    router.replace("/(tabs)");
  }
  return <LandingScreen />;
};

export default index;
