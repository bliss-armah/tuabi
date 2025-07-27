import { useAuth } from "@/Shared/Hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";
import LoginScreen from "@/Features/Authentication/Login";

const Login = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  return <LoginScreen />;
};

export default Login;
