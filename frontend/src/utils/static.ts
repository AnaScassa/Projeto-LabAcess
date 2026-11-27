declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      VITE_FRONTEND_URL?: string;
      VITE_SMARTCARD_URL?: string;
      VITE_USERS_URL?: string;
    };
  }
}

const normalizeUrl = (value: string | undefined, fallback: string) => {
  const candidate = (value ?? fallback).trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(candidate) ? candidate : `http://${candidate}`;
};

export const API_HOST =
  window.RUNTIME_CONFIG?.VITE_FRONTEND_URL || "localhost";

export const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export const SMARTCARD_API_BASE = normalizeUrl(window.RUNTIME_CONFIG?.VITE_SMARTCARD_URL, "https://dev.ccs.unicamp.br/smartcard");
export const USERS_API_BASE = normalizeUrl(window.RUNTIME_CONFIG?.VITE_USERS_URL, "https://dev.ccs.unicamp.br/users");