import React from "react";
import { Card as UIKittenCard, CardProps } from "@ui-kitten/components";
import { useColorScheme } from "../../Hooks/useColorScheme";

interface CustomCardProps extends CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CustomCardProps> = ({
  children,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();

  return (
    <UIKittenCard
      style={[
        {
          marginVertical: 5,
          marginHorizontal: 15,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </UIKittenCard>
  );
};
