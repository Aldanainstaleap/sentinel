#!/bin/bash
# Script to create a .env file from Codespace/Dev Container environment variables.
# It checks for the required variables injected from secrets and exits if they are not found.

# Ensures that the script will exit immediately if a command fails.
set -euo pipefail

# --- Variable Validation ---
# Check that all required secrets for the application runtime have been set.
if [ -z "${AUTH_CONFIG:-}" ] || \
   [ -z "${DB_CONFIG:-}" ] || \
   [ -z "${CORS_CONFIG:-}" ] || \
   [ -z "${PG_CONFIG:-}" ] || \
   [ -z "${AWS_CONFIG:-}" ]; then
  echo "❌ Error: One or more required environment variables are not set as Codespace secrets."
  echo "Please ensure you have configured the following secrets in your GitHub account:"
  echo "  - AUTH_CONFIG"
  echo "  - DB_CONFIG"
  echo "  - CORS_CONFIG"
  echo "  - PG_CONFIG"
  echo "  - AWS_CONFIG"
  exit 1
fi

# --- File Generation ---
# Create the .env file using the secrets.
cat > .env << EOF
# This file was generated automatically by scripts/setup-env.sh for the development environment.
# Do not commit this file to version control.

# --- Server ---
PORT=3000

# --- Configurations (from GitHub Codespace Secrets) ---
AUTH_CONFIG='${AUTH_CONFIG}'
DB_CONFIG='${DB_CONFIG}'
PG_CONFIG='${PG_CONFIG}'
AWS_CONFIG='${AWS_CONFIG}'
CORS_CONFIG='${CORS_CONFIG}'
EOF

# Grant read/write permissions to the owner for security.
chmod 600 .env

echo "✅ .env file created successfully from secrets."