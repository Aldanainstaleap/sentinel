#!/bin/bash

set -e

# --- Task: SSH Configuration (Smart Based on Environment) ---
SETUP_KEY=false

if [ -f ~/.ssh/id_rsa ]; then
    # A key already exists. We'll check if we're in Codespaces to decide what to do.
    if [ "$CODESPACES" = "true" ]; then
        echo "✅ SSH key already exists. It was likely generated automatically by GitHub Codespaces."
        while true; do
            read -p "Do you want to replace this automatically generated key with your own? (yes/no): " replace_key
            replace_key_lower=$(echo "$replace_key" | tr '[:upper:]' '[:lower:]')

            if [[ "$replace_key_lower" == "yes" || "$replace_key_lower" == "y" ]]; then
                echo "Removing existing key to start a new setup..."
                rm -f ~/.ssh/id_rsa ~/.ssh/id_rsa.pub
                SETUP_KEY=true
                break
            elif [[ "$replace_key_lower" == "no" || "$replace_key_lower" == "n" ]]; then
                echo "Keeping existing SSH key. Skipping interactive setup."
                SETUP_KEY=false
                break
            else
                echo -e "\033[0;31mInvalid input.\033[0m Please type 'yes' or 'no'."
            fi
        done
    else
        echo "✅ SSH key already exists (mounted from local machine). Skipping SSH generation."
        SETUP_KEY=false
    fi
else
    SETUP_KEY=true
fi

if [ "$SETUP_KEY" = true ]; then
    echo "--- SSH Key not found or will be replaced. Starting interactive setup... ---"
    
    read -p "📧 Please enter your GitHub email address to generate a new SSH key: " user_email
    ssh-keygen -t ed25519 -C "$user_email" -f ~/.ssh/id_rsa -N ""
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/id_rsa

    echo -e "\n\n✅ SSH key generated successfully!"
    echo "-------------------------------------------------------------------"
    echo "🔑 Here is your public SSH key. Please add it to your GitHub account:"
    echo "-------------------------------------------------------------------"
    echo -e "\033[0;32m"
    cat ~/.ssh/id_rsa.pub
    echo -e "\033[0m"
    echo "-------------------------------------------------------------------"
    
    # Display the clickable URL and wait for the first Enter.
    echo -e "Go to the following URL to add your key:"
    echo -e "   \033[0;34;4mhttps://github.com/settings/keys\033[0m"
    read -p "Press [Enter] after setting the key on GitHub..."


    while true; do
        read -p "Have you configured your credentials on GitHub? Type 'yes' to confirm: " confirmation
        confirmation_lower=$(echo "$confirmation" | tr '[:upper:]' '[:lower:]')
        if [[ "$confirmation_lower" == "yes" ]]; then
            echo "Confirmation received. Proceeding..."
            break
        else
            echo -e "\033[0;31mConfirmation not 'yes'.\033[0m Please complete the setup."
        fi
    done
fi

ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
chmod 644 ~/.ssh/known_hosts
echo "Verifying SSH connection with GitHub..."
ssh -T git@github.com || true

# --- Task: Configure AWS CLI (if needed) ---
if [ ! -f ~/.aws/credentials ]; then
    echo -e "\n--- AWS credentials not found. Starting first-time setup... ---"
    aws configure
    echo "✅ AWS credentials configured successfully!"
else
    echo "✅ AWS credentials already exist. Skipping AWS configuration."
fi

# --- Task: Create a "marker" to avoid re-running this script ---
touch ~/.devcontainer-first-run-complete
echo -e "\n🎉 First-time setup complete! Future terminals will start instantly."