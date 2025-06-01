import LandingScreen from "@/Features/LandingScreen.tsx/LandingScreen";
import { useAuth } from "@/Shared/Hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";

const index = () => {
  const { token } = useAuth() 
      useEffect(() => {
        router.replace("/(tabs)")
      }, [token])
  return <LandingScreen />;
};

export default index;
