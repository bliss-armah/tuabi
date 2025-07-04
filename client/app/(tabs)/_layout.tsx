import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/Shared/Constants/Colors";
import { useColorScheme } from "@/Shared/Hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
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
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    height: 3,
                    width: 30,
                    backgroundColor: Colors[theme].primary,
                    borderBottomRightRadius: 3,
                    borderBottomLeftRadius: 3,
                    position: "absolute",
                    top: -15,
                  }}
                />
              )}
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
              {focused && (
                <View
                  style={{
                    height: 3,
                    width: 30,
                    backgroundColor: Colors[theme].primary,
                    borderRadius: 2,
                    position: "absolute",
                    top: -15,
                  }}
                />
              )}
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
        name="subscription"
        options={{
          title: "Subscription",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    height: 3,
                    width: 30,
                    backgroundColor: Colors[theme].primary,
                    borderRadius: 2,
                    position: "absolute",
                    top: -15,
                  }}
                />
              )}
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
              {focused && (
                <View
                  style={{
                    height: 3,
                    width: 30,
                    backgroundColor: Colors[theme].primary,
                    borderRadius: 2,
                    position: "absolute",
                    top: -15,
                  }}
                />
              )}
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
