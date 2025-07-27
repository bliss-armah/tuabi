import React, { useState } from "react";
import { Input as UIKittenInput, InputProps } from "@ui-kitten/components";
import { Text } from "react-native";
import { Colors } from "@/Shared/Constants/Colors";

interface CustomInputProps extends InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad";
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  status?: "basic" | "primary" | "success" | "info" | "warning" | "danger";
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  status = "basic",
  style,
  ...props
}) => {
  // Add local focus state
  const [isFocused, setIsFocused] = useState(false);

  // Determine border and text color based on state
  let borderColor = Colors.border;
  let textColor = Colors.text;
  if (disabled) {
    borderColor = Colors.textSecondary;
    textColor = Colors.textSecondary;
  } else if (isFocused) {
    borderColor = Colors.primary;
  }

  // Wrap label in Text with fontSize 14 and marginBottom for spacing
  const renderLabel = label
    ? () => (
        <Text style={{ fontSize: 14, marginBottom: 8, color: Colors.text }}>
          {label}
        </Text>
      )
    : undefined;

  return (
    <UIKittenInput
      label={renderLabel}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      disabled={disabled}
      status={status}
      style={[
        {
          marginBottom: 15,
          borderColor,
          borderWidth: 1.2,
          backgroundColor: "transparent",
          borderRadius: 8,
        },
        style,
      ]}
      textStyle={{ fontSize: 12, color: textColor }}
      placeholderTextColor={Colors.textSecondary}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};
