declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      VITE_FRONTEND_URL?: string;
    };
  }
}

export const API_HOST =
  window.RUNTIME_CONFIG?.VITE_FRONTEND_URL || "localhost";

export const SMARTCARD_API_BASE = `http://${API_HOST}:8080`;
export const USERS_API_BASE = `http://${API_HOST}:8001`;