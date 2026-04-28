#!/bin/bash
#
# This script generates a new dbmate migration file by leveraging the 'dbmate' service
# in docker-compose YAML file. Improved for Windows compatibility.

# Exit immediately if a command exits with a non-zero status.
set -e

# validate the number of arguments
if [ "$#" -ne 2 ]; then
  echo "❌ Error: Invalid number of arguments."
  echo ""
  echo "Usage: npm run dbmate:generate -- <database_name> <MigrationNameInPascalCase>"
  echo "Example: npm run dbmate:generate -- nebula CreateUsersTable"
  echo "Valid database names are: coulson, deadpool, nebula, odin"
  exit 1
fi

# Assign arguments
DB_NAME=$1
MIGRATION_NAME=$2

# Determine the absolute path to the project root directory
# Handle Windows paths properly
PROJECT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert Windows-style path to Unix-style if on Windows (Git Bash)
if [[ "$PROJECT_ROOT_DIR" =~ ^/[a-z]/ ]]; then
    # We're in Git Bash, convert /c/... to C:/...
    PROJECT_ROOT_DIR=$(echo "$PROJECT_ROOT_DIR" | sed 's|^/\([a-z]\)/|\1:/|')
fi

# Define the relative path to the migrations directory from the project root
HOST_MIGRATIONS_DIR="src/persistence/${DB_NAME}/migrations"

# Validate the target database directory
if [ ! -d "${PROJECT_ROOT_DIR}/${HOST_MIGRATIONS_DIR}" ]; then
  echo "❌ Error: Migrations directory not found on the host."
  echo "Checked path: ${PROJECT_ROOT_DIR}/${HOST_MIGRATIONS_DIR}"
  echo "Please make sure the directory structure is correct."
  exit 1
fi

# Execute the migration generation command
echo "▶️  Generating migration for database: '${DB_NAME}'"
echo "   Project Directory: '${PROJECT_ROOT_DIR}'"
echo "   Migration Name: '${MIGRATION_NAME}'"
echo "   Target Directory: '${HOST_MIGRATIONS_DIR}'"

# Set MSYS_NO_PATHCONV to prevent Git Bash from converting paths
export MSYS_NO_PATHCONV=1

# Execute docker compose run
docker compose --project-directory "$PROJECT_ROOT_DIR" run --rm dbmate \
  --migrations-dir="/db/persistence/${DB_NAME}/migrations" new "$MIGRATION_NAME"

echo "✅ Success! New migration file created in '${HOST_MIGRATIONS_DIR}'."