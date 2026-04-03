import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 3001;

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function extractHost(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const withoutProtocol = value.replace(/^https?:\/\//, "");
  const hostWithPort = withoutProtocol.split("/")[0] ?? "";
  const host = hostWithPort.split(":")[0] ?? "";
  return host || null;
}

function getExpoRuntimeHost(): string | null {
  const constants = Constants as unknown as {
    expoGoConfig?: { debuggerHost?: string; hostUri?: string };
    expoConfig?: { hostUri?: string };
  };

  const candidates = [
    constants.expoGoConfig?.debuggerHost,
    constants.expoGoConfig?.hostUri,
    constants.expoConfig?.hostUri,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
}

export function getApiBaseUrl(): string {
  if (Platform.OS === "web") {
    return "/api";
  }
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicitApiUrl) {
    return trimTrailingSlash(explicitApiUrl);
  }
  const domain = Constants.expoConfig?.extra?.domain ??
    process.env.EXPO_PUBLIC_DOMAIN ??
    "";
  if (domain) {
    return `https://${domain}/api`;
  }
  const runtimeHost = getExpoRuntimeHost();
  if (runtimeHost) {
    return `http://${runtimeHost}:${API_PORT}/api`;
  }
  return `http://localhost:${API_PORT}/api`;
}
