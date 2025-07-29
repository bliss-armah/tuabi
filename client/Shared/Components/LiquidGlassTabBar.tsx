import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../Constants/Colors";

const { width } = Dimensions.get("window");

interface TabItem {
  key: string;
  title: string;
  icon: string;
  iconOutline: string;
}

interface LiquidGlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: TabItem[] = [
  { key: "index", title: "Home", icon: "home", iconOutline: "home-outline" },
  {
    key: "debtors",
    title: "Debtors",
    icon: "people",
    iconOutline: "people-outline",
  },
  {
    key: "plans",
    title: "Plans",
    icon: "card",
    iconOutline: "card-outline",
  },
  {
    key: "profile",
    title: "Profile",
    icon: "person",
    iconOutline: "person-outline",
  },
];

export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({}).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const labelWidths = useRef<{ [key: string]: number }>({}).current;

  // Initialize animated values
  useEffect(() => {
    tabs.forEach((tab) => {
      if (!animatedValues[tab.key]) {
        animatedValues[tab.key] = new Animated.Value(0);
      }
    });
  }, []);

  // Shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateTab = (tabKey: string, isActive: boolean) => {
    Animated.spring(animatedValues[tabKey], {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const renderTab = (tab: TabItem, index: number) => {
    const route = state.routes.find((r: any) => r.name === tab.key);
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    useEffect(() => {
      animateTab(tab.key, isFocused);
    }, [isFocused]);

    const iconScale =
      animatedValues[tab.key]?.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
      }) || 1;

    const labelOpacity =
      animatedValues[tab.key]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }) || 0;

    const labelTranslateX =
      animatedValues[tab.key]?.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 0],
      }) || 8;

    const backgroundOpacity =
      animatedValues[tab.key]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }) || 0;

    const tabWidth =
      animatedValues[tab.key]?.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 120],
      }) || 50;

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={onPress}
        style={styles.tabButton}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [{ scale: iconScale }],
              width: tabWidth,
            },
          ]}
        >
          {/* Active Background */}
          <Animated.View
            style={[
              styles.activeBackground,
              {
                opacity: backgroundOpacity,
              },
            ]}
          >
            <BlurView
              intensity={Platform.OS === "ios" ? 80 : 90}
              tint="dark"
              style={styles.activeBlurView}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeGradient}
            />
          </Animated.View>

          {/* Icon */}
          <Ionicons
            name={isFocused ? (tab.icon as any) : (tab.iconOutline as any)}
            size={22}
            color={isFocused ? Colors.white : Colors.white}
            style={styles.icon}
          />

          {/* Animated Label */}
          <Animated.View
            style={[
              styles.labelContainer,
              {
                opacity: labelOpacity,
                transform: [{ translateX: labelTranslateX }],
              },
            ]}
            onLayout={(event) => {
              labelWidths[tab.key] = event.nativeEvent.layout.width;
            }}
          >
            <Text style={styles.label}>{tab.title}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBarBackground}>
        {/* Brand color glow border */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary, `${Colors.primary}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowBorder}
        />

        {/* Shimmer effect */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, width],
                  }),
                },
              ],
            },
          ]}
        />

        <View style={styles.tabBarContent}>
          {tabs.map((tab, index) => renderTab(tab, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  tabBarBackground: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: `${Colors.primary}50`,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    opacity: 0.4,
    zIndex: 1,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: "100%",
    borderRadius: 30,
    backgroundColor: `${Colors.primary}30`,
    zIndex: 2,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 3,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 22,
    marginHorizontal: 4,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    position: "relative",
    minWidth: 50,
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    overflow: "hidden",
    zIndex: 0,
  },
  activeBlurView: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  activeGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    zIndex: 1,
  },
  icon: {
    marginRight: 6,
  },
  labelContainer: {
    marginLeft: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
    textAlign: "center",
  },
});
