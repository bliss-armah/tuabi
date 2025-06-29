import React from "react";
import { Input as UIKittenInput, InputProps } from "@ui-kitten/components";

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

  return (
    <UIKittenInput
      label={label}
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
        },
        style,
      ]}
      {...props}
    />
  );
};
