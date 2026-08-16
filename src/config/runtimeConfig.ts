const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const useMockApi = (import.meta.env.VITE_USE_MOCK_API ?? (import.meta.env.DEV ? "true" : "false")) === "true";

export const runtimeConfig = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
  useMockApi,
  isProduction: import.meta.env.PROD,
} as const;

export function requireProductionApiConfig() {
  if (runtimeConfig.isProduction && !runtimeConfig.useMockApi && !runtimeConfig.apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL wajib diisi ketika mock API dimatikan.");
  }
}
