declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      VITE_FRONTEND_URL?: string;
    };
  }
}

export const API_HOST =
  window.RUNTIME_CONFIG?.VITE_FRONTEND_URL || "http://localhost";