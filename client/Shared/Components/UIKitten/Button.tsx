import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
}

const getButtonStyle = (
  variant: "primary" | "secondary",
  disabled: boolean,
  size: string
): ViewStyle => {
  let base: ViewStyle = {
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: size === "large" ? 16 : size === "small" ? 8 : 12,
    paddingHorizontal: size === "large" ? 32 : size === "small" ? 16 : 24,
    opacity: disabled ? 0.5 : 1,
  };
  if (variant === "primary") {
    return {
      ...base,
      backgroundColor: Colors.primary,
    };
  } else {
    return {
      ...base,
      backgroundColor: Colors.background,
      borderWidth: 2,
      borderColor: Colors.primary,
    };
  }
};

const getTextStyle = (
  variant: "primary" | "secondary",
  size: string
): TextStyle => {
  return {
    color: variant === "primary" ? "#fff" : Colors.primary,
    fontWeight: "bold",
    fontSize: size === "large" ? 18 : size === "small" ? 14 : 16,
  };
};

export const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  size = "medium",
  icon,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(variant, disabled || loading, size), style]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#fff" : Colors.primary}
          style={{ marginRight: 8 }}
        />
      ) : null}
      {icon}
      <Text style={[getTextStyle(variant, size), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
