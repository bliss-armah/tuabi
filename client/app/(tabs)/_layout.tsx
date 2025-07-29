import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/Shared/Constants/Colors";
import { LiquidGlassTabBar } from "@/Shared/Components/LiquidGlassTabBar";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.icon,
        headerShown: false,
        tabBarStyle: {
          display: "none", // Hide default tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="debtors"
        options={{
          title: "Debtors",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "card" : "card-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
