# !/bin/bash
#
# Script to install necessary AI CLI dependencies for development environment.
# This script installs Gemini CLI and GitHub Copilot CLI tools with proper error handling.
# 
# Prerequisites:
#   - npm (for Gemini CLI installation)
#   - gh CLI (for GitHub Copilot CLI installation)
#
# Usage: ./scripts/install-dependencies.sh

# Install Gemini CLI
echo "Installing Gemini CLI..."
if command -v npm &> /dev/null; then
    npm install -g @google/gemini-cli
else
    echo "npm not found, skipping Gemini CLI installation"
fi

# Install GitHub Copilot CLI
echo "Installing GitHub Copilot CLI..."

if ! command -v gh &> /dev/null; then
    echo "⚠️ GitHub CLI (gh) not found, skipping Copilot CLI installation"
else
    echo "🔍 Attempting to install GitHub Copilot CLI using a temporary token..."
    # Use a subshell to ensure GH_TOKEN is only set for this command.
    # This prevents it from leaking into the user's interactive shell environment.
    (
      export GH_TOKEN="$COPILOT_GITHUB_TOKEN"
      if gh extension install github/gh-copilot; then
          echo "✅ Copilot CLI extension installed successfully."
      else
          echo "❌ Failed to install Copilot CLI extension. This might be because:"
          echo "  - It's already installed"
          echo "  - The provided COPILOT_GITHUB_TOKEN is invalid or lacks permissions"
          echo "  - Network connection issues"
      fi
    )
fi

# Display installation status
echo "✅ AI CLI Tools installation completed!"
echo "Remember to authenticate each service:"
echo "  - Claude Code: Follow authentication prompts on first use"
echo "  - Gemini CLI: Set up Google Cloud credentials"
echo "  - GitHub Copilot CLI: Ensure you're authenticated with 'gh auth login'"
