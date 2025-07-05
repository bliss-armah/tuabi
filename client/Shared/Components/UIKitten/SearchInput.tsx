import React from "react";
import { Input as UIKittenInput } from "@ui-kitten/components";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../Constants/Colors";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  style?: any;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onClear,
  style,
}) => {

  const renderAccessoryRight = () => {
    if (value && value.length > 0) {
      return () => (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={20} color={Colors.icon} />
        </TouchableOpacity>
      );
    }
    return () => <Ionicons name="search" size={20} color={Colors.icon} />;
  };

  return (
    <UIKittenInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      accessoryRight={renderAccessoryRight()}
      style={[
        {
          marginBottom: 10,
        },
        style,
      ]}
    />
  );
};
