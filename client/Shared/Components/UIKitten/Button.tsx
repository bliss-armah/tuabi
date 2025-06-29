import React from "react";
import { Button as UIKittenButton, ButtonProps } from "@ui-kitten/components";
import { ActivityIndicator } from "react-native";

interface CustomButtonProps extends ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  status?: "basic" | "primary" | "success" | "info" | "warning" | "danger";
  size?: "tiny" | "small" | "medium" | "large" | "giant";
  appearance?: "filled" | "outline" | "ghost";
  style?: any;
}

export const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  status = "primary",
  size = "medium",
  appearance = "filled",
  style,
  ...props
}) => {
  const renderAccessory = () => {
    if (loading) {
      return () => <ActivityIndicator size="small" color="white" />;
    }
    return undefined;
  };

  return (
    <UIKittenButton
      onPress={onPress}
      disabled={disabled || loading}
      status={status}
      size={size}
      appearance={appearance}
      accessoryLeft={renderAccessory()}
      style={[
        {
          marginVertical: 10,
        },
        style,
      ]}
      {...props}
    >
      {title}
    </UIKittenButton>
  );
};
