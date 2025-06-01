import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].primary,
          tabBarInactiveTintColor: Colors[theme].icon,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors[theme].card,
            borderTopColor: Colors[theme].border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ position: "relative" }}>
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
          name="add-debtor"
          options={{
            title: "Add",
            tabBarIcon: ({ color }) => (
              <Ionicons name="add" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="debtors"
          options={{
            title: "Debtors",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
