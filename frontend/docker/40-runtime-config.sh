#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<CONFIG
window.RUNTIME_CONFIG = {
  VITE_FRONTEND_URL: "${VITE_FRONTEND_URL:-localhost}",
  VITE_SMARTCARD_URL: "${VITE_SMARTCARD_URL:-http://api.localhost}",
  VITE_USERS_URL: "${VITE_USERS_URL:-http://users.localhost}"
};
CONFIG
