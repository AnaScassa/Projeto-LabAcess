#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<CONFIG
window.RUNTIME_CONFIG = {
  VITE_FRONTEND_URL: "${VITE_FRONTEND_URL:-localhost}"
};
CONFIG
