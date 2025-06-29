import React from "react";
import { ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva"; // ✅ Needed
import { customLightTheme, customDarkTheme } from "../Constants/UIKittenTheme";
import { useColorScheme } from "../Hooks/useColorScheme";

interface UIKittenProviderProps {
  children: React.ReactNode;
}

export const UIKittenProvider: React.FC<UIKittenProviderProps> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? customDarkTheme : customLightTheme;

  return (
    <ApplicationProvider mapping={eva.mapping} theme={theme}>
      {children}
    </ApplicationProvider>
  );
};
