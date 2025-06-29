import React from "react";
import { Modal as UIKittenModal, ModalProps } from "@ui-kitten/components";
import { useColorScheme } from "../../Hooks/useColorScheme";

interface CustomModalProps extends ModalProps {
  children: React.ReactNode;
  visible: boolean;
  onBackdropPress?: () => void;
  style?: any;
}

export const Modal: React.FC<CustomModalProps> = ({
  children,
  visible,
  onBackdropPress,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();

  return (
    <UIKittenModal
      visible={visible}
      onBackdropPress={onBackdropPress}
      style={[
        {
          width: "90%",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </UIKittenModal>
  );
};
