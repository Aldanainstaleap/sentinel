# Scripts

This directory contains various scripts for setting up and managing the project environment. These scripts automate tasks such as environment setup, dependency installation, and other development-related processes.

## Scripts

### `interactive-setup.sh`

This script performs an interactive first-time setup for the development environment.

**Functionality:**

- **SSH Key Generation:** Checks if an SSH key exists. If not, or if the user chooses to replace an existing key in a Codespaces environment, it prompts for a GitHub email and generates a new SSH key (`ed25519`).
- **GitHub Configuration:** Displays the public SSH key and instructs the user to add it to their GitHub account, ensuring the connection to the repository is secure.
- **AWS CLI Configuration:** Checks for AWS credentials. If they are not found, it initiates the `aws configure` process to set them up.
- **Completion Marker:** Creates a marker file (`~/.devcontainer-first-run-complete`) to ensure this setup process only runs once.

**Usage:**

This script is intended to be run automatically on the first terminal session within the dev container.

### `post-create-codespace.sh`

This script serves as the main entry point for post-creation setup in a GitHub Codespace.

**Functionality:**

- **Environment Setup:** Creates a `.env` file from Codespace environment variables by running `setup-env.sh`.
- **Common Setup:** Executes the `post-create-common.sh` script to perform tasks common to all environments.

**Usage:**

This script is automatically executed when the Codespace is created.

### `post-create-common.sh`

This script contains setup tasks that are common to all development environments (local and Codespaces).

**Functionality:**

- **Shell Configuration:** Modifies the `.bashrc` file to run the `interactive-setup.sh` script on the first terminal session. It also configures the SSH agent and fixes permissions for SSH keys.
- **Git Configuration:** Configures Git to trust the workspace directory, preventing potential ownership issues.

**Usage:**

This script is executed by `post-create-codespace.sh` or can be run manually in a local setup.

### `setup-env.sh`

This script is responsible for creating the `.env` file from environment variables. The specific implementation is not shown here but it would typically read from Codespace secrets or other environment sources.

**Usage:**

This script is called by `post-create-codespace.sh`.

### `flatten_repo.sh`

This script generates a flattened version of the repository, combining all source code into a single text file. This is useful for providing context to large language models.

**Functionality:**

- **File Aggregation:** Traverses the repository and concatenates the content of non-ignored files into a single output file (`repository_flattened.txt` by default).
- **Configurable Ignores:** Allows ignoring specific directories, filenames, and extensions through environment variables (`PARAM_IGNORE_DIRS`, `PARAM_IGNORE_FILENAMES`, `PARAM_IGNORE_EXTS`).
- **Internal Ignores:** By default, it ignores common binary files, media assets, and development-related directories like `.git` and `.vscode`.

**Usage:**

This script is primarily used in the `flatten_repo.yml` GitHub Actions workflow but can also be run manually.

```bash
./scripts/flatten_repo.sh [output_file_name]
```

### `generate-migration-file.sh`

This script generates a new database migration file using `dbmate` and Docker Compose.

**Functionality:**

- **Migration Generation:** Automates the creation of timestamped migration files for a specified database.
- **Docker Integration:** Runs the `dbmate` command within its designated Docker service, ensuring a consistent environment.

**Usage:**

To generate a migration, run the following command, replacing `<database_name>` and `<MigrationNameInPascalCase>` with your details.

```bash
npm run dbmate:generate -- <database_name> <MigrationNameInPascalCase>
```

Example:

```bash
npm run dbmate:generate -- nebula CreateUsersTable
```

### `setup-dependencies.sh`

This script installs additional CLI tools that are useful for development, particularly for interacting with AI services.

**Functionality:**

- **Gemini CLI Installation:** Installs the `@google/gemini-cli` package globally via `npm`.
- **GitHub Copilot CLI Installation:** Installs the `github/gh-copilot` extension for the GitHub CLI (`gh`).

**Usage:**

This script can be run manually to set up the required tools.

```bash
./scripts/setup-dependencies.sh
```
