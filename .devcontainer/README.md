# sentinel Development Environments

This repository is configured to use **Visual Studio Code Dev Containers**, providing a consistent, reproducible, and "zero-install" development environment for both local and cloud-based (GitHub Codespaces) workflows.

This guide explains how to set up and use the development environment for all supported scenarios.

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Visual Studio Code**: The code editor.
- **Docker Desktop**: To build and run the containers.
- **VS Code Dev Containers Extension**: To connect VS Code to the development container.

## 🔑 How Configuration and Secrets Work

The environment is configured differently depending on whether you are working locally or in GitHub Codespaces.

| Environment                   | How it's Configured                                                                                                                                                                         |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GitHub Codespaces**         | The `.env` file is **automatically generated** from secrets you configure in your GitHub account (`AUTH_CONFIG`, `DB_CONFIG`, etc.). This is the recommended and simplest approach.         |
| **Local (WSL/Windows/Linux)** | You must **manually create a `.env` file** by copying `.env.example`. On your first terminal session, an interactive script will guide you through setting up your SSH and AWS credentials. |

---

## 📁 Configurations Overview

This project provides multiple Dev Container configurations. You will be prompted to choose one when you first open the project in a container.

- **`.devcontainer/devcontainer.json`**:

  - **Purpose**: The default configuration, specifically tailored for **GitHub Codespaces**.
  - **How it's used**: GitHub automatically uses this file when you create a new Codespace.

- **`.devcontainer/linux/devcontainer.json`**:

  - **Purpose**: Optimized for **local development on a Linux machine** or **Windows with WSL**.
  - **How it's used**: The recommended choice for performance on local machines.

- **`.devcontainer/windows/devcontainer.json`**:
  - **Purpose**: Optimized for **local development on a native Windows machine**.
  - **How it's used**: For developers working on Windows with Docker Desktop without WSL.

---

## 🚀 Getting Started: Step-by-Step

**First time?** If you have previously created sentinel containers, run `docker compose down -v --remove-orphans` to avoid conflicts.

### Scenario 1: GitHub Codespaces (Easiest)

This is the simplest way to get a fully configured environment.

#### **Prerequisite: Configure GitHub User Secrets**

Before launching, you must configure secrets in your GitHub account. This is a one-time setup.

1.  **Navigate to Codespaces Secrets**: Go to `GitHub Settings > Codespaces > Secrets`.
2.  **Add Required Secrets**: Create a new secret for each of the following. These will be used to automatically generate your `.env` file inside the Codespace. 2. **Add Required Secrets**: Create a new secret for each of the following variables found in `.env.example`. These will be used to automatically generate your configuration inside the Codespace.
    - `NPM_TOKEN`: Your npm authentication token for private GitHub packages.
    - `AUTH_CONFIG`: JSON string with your authentication configuration (OAuth, etc.).
    - `DB_CONFIG`: JSON string with your database connection details (user, password, host, port).
    - `PG_CONFIG`: JSON string for PostgreSQL-specific settings like the database name and pool configuration.
    - `AWS_CONFIG`: JSON string for AWS configuration, primarily the region.
    - `CORS_CONFIG`: JSON string for CORS origins configuration.
    - `COPILOT_GITHUB_TOKEN`: Your GitHub personal access token (classic) to authenticate the Copilot CLI.

> **Tip**: You can override repository-level secrets with your own user-level secrets for personalization.

#### **Launch the Codespace**

1.  **Navigate to the Repository**: Go to the project's main page on GitHub.
2.  **Create Codespace**: Click the **`< > Code`** button, select the **"Codespaces"** tab, and click **"Create codespace on..."**.

GitHub will build the environment, and the `post-create-codespace.sh` script will automatically create the `.env` file from your configured secrets.

---

### Scenario 2: Local Development (WSL, Linux, or Windows)

This approach gives you a containerized environment on your local machine. The steps are nearly identical for all local setups.

1.  **Clone the Repository:**

    - For WSL users, it is crucial to clone the project inside the Linux file system, **not** in `/mnt/c/`.

2.  **Create the `.env` File:**

    - Copy the `.env.example` file and rename it to `.env`.
    - Fill in the required values (`NPM_TOKEN`, `AUTH_CONFIG`, `DB_CONFIG`, etc.) with your local development credentials.

3.  **Open in VS Code and Reopen in Container:**
    - Open the project folder in VS Code.
    - A notification will appear prompting you to **"Reopen in Container"**. Click it.
    - If prompted, choose the appropriate configuration for your OS (`Linux` for WSL/Linux, `Windows` for native Windows).

---

## ✨ The First Run Experience

When you open a terminal in the dev container for the first time, an **interactive setup script** will run automatically. This script will:

1.  **Configure SSH**: It will check for an SSH key. If one is not found, it will guide you through generating one and adding it to your GitHub account.
2.  **Configure AWS CLI**: It will check for AWS credentials. If they are missing, it will launch `aws configure` to help you set them up.

After you complete this one-time setup, your terminal will start instantly on subsequent sessions.

---

## 🔄 Managing the Dev Container Lifecycle: Reopening vs. Rebuilding

- **Reopen in Container**: Your day-to-day command. It quickly attaches VS Code to your _existing, running container_. Use this every time you start working.

- **Rebuild and Reopen in Container**: This destroys and rebuilds the container from scratch. You **must** use this if you change any environment configuration files, otherwise your changes will not be applied.
  > Use "Rebuild" if you modify: `Dockerfile*`, `docker-compose.yml`, any `devcontainer.json`, or any setup script.

---

## 🛠️ Included Services and Tools

- **Services**:
  - `sentinel-debug`: The main Node.js application container with hot-reloading.
  - `sentinel-postgres`: PostgreSQL database for development.
- **Tools**:
  - Git, Docker (via Docker-in-Docker), AWS CLI, Terraform.

## 🤖 AI Coding Assistants

The environment comes pre-installed with tools to boost your productivity. You will need to authenticate them on first use.

- **GitHub Copilot CLI**: To use it in the terminal, first run `gh auth login`.
- **Claude Code**: Available as a VS Code extension.
- **Gemini CLI**: Available in the terminal.

## 🔌 Exposed Ports

- `3000`: The sentinel application.
- `9230`: The Node.js debugger.
