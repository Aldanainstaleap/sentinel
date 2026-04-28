#!/bin/bash
#
# This script serves as the main entry point for the post-creation setup in a GitHub Codespace.
# It orchestrates a series of Codespace-specific tasks, such as configuring .env file with secrets
# for private repository access, before delegating to the common setup script (i.e. run-migrations.sh).

set -e

echo "--- 🚀 Starting CODESPACES Post Create Setup ---"

# Prepare the environment for Codespaces specific tasks

# --- Task 1: Create .env file from Codespace environment ---
echo "🔄 [1/2] Creating .env file from Codespace environment..."
bash /var/www/scripts/setup-env.sh
echo "✅ [1/2] .env file created."

# --- Task 2: Execute common setup tasks ---
echo "🔄 [2/2] Running common setup tasks (migrations)..."
bash /var/www/scripts/post-create-common.sh

echo "--- 🎉 CODESPACES Setup Finished Successfully! ---"