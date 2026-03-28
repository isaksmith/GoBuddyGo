import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiBaseUrl(): string {
  if (Platform.OS === "web") {
    return "/api";
  }
  const domain = Constants.expoConfig?.extra?.domain ??
    process.env.EXPO_PUBLIC_DOMAIN ??
    "";
  if (domain) {
    return `https://${domain}/api`;
  }
  return "http://localhost:3000/api";
}
