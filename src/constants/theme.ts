import { useColorScheme } from "react-native";

export interface AppTheme {
  isDark: boolean;
  background: string;
  surface: string;
  text: string;
  placeholder: string;
  metaText: string;
  buttonGradientTop: string;
  buttonGradientBottom: string;
  buttonBorder: string;
}

const LIGHT_THEME: AppTheme = {
  isDark: false,
  background: "#FFFFFF",
  surface: "#E9E9E9",
  text: "#000000",
  placeholder: "rgba(0, 0, 0, 0.55)",
  metaText: "#000000",
  buttonGradientTop: "#E6E6E6",
  buttonGradientBottom: "#FFFFFF",
  buttonBorder: "#AEAEAE",
};

const DARK_THEME: AppTheme = {
  isDark: true,
  background: "#0A0A0A",
  surface: "#161616",
  text: "#D7D7D7",
  placeholder: "rgba(215, 215, 215, 0.55)",
  metaText: "#FFFFFF",
  buttonGradientTop: "#1B1B1B",
  buttonGradientBottom: "#000000",
  buttonBorder: "#363636",
};

export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;
}
