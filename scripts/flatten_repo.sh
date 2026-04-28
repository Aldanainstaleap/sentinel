#!/bin/bash

# Script: repository_flatten.sh
#
# Description:
#   This script recursively traverses the current repository and generates a single
#   flattened text file that contains the contents of all relevant files.
#   Files that are binary, media, sensitive configuration (I.e, .env*), or commonly
#   ignored (I.e, .git, node_modules) are skipped.
#
# Usage:
#   ./repository_flatten.sh [OUTPUT_FILE]
#
# Parameters:
#   OUTPUT_FILE (optional) - Path/name of the output file. 
#                            Default: repository_flattened.txt
#
# Environment Variables (optional):
#   PARAM_IGNORE_DIRS        Comma-separated list of directories to ignore
#   PARAM_IGNORE_FILENAMES   Comma-separated list of specific filenames to ignore
#   PARAM_IGNORE_EXTS        Comma-separated list of file extensions to ignore
#   PARAM_IGNORE_ENV_PATTERNS Pattern(s) for environment/config files (default: ".env*")
#
# Ignored by default:
#   - Directories: .git, .github
#   - Filenames: .DS_Store, Thumbs.db
#   - Extensions: common binary, media, archive, and document formats
#   - Patterns: .env*
#
# Example:
#   ./repository_flatten.sh output.txt
#
# Result:
#   A single text file containing all processed file contents,
#   each preceded by a header indicating its relative path.
#
# Notes:
#   - Empty/trailing commas in ignore lists are automatically cleaned.
#   - Extensions are matched case-insensitively.
#   - The script stops immediately on errors (set -euo pipefail).

# Exit script on any error (-e), treat unset variables as an error (-u),
# and propagate pipeline errors (-o pipefail)
set -euo pipefail

# --- Configuration ---

# Default output file name. Can be overridden by the first script argument.
DEFAULT_OUTPUT_FILE="repository_flattened.txt"
OUTPUT_FILE="${1:-$DEFAULT_OUTPUT_FILE}"

# --- Internal, Universal Ignores ---
# These are generally always ignored, regardless of project type.
# The .github directory is excluded later in the main loop.
INTERNAL_IGNORE_DIRS=(".git")
INTERNAL_IGNORE_FILENAMES=(".DS_Store" "Thumbs.db")
# Basic binary/media extensions often universally ignored
INTERNAL_IGNORE_EXTS=(
    # Images
    "png" "jpg" "jpeg" "gif" "bmp" "ico" "tif" "tiff" "webp"
    # Videos/Audio
    "mp4" "avi" "mov" "wmv" "flv" "mp3" "wav" "ogg" "m4a"
    # Binaries/Executables
    "exe" "dll" "so" "dylib" "o" "a" "class"
    # Archives
    "zip" "tar" "gz" "bz2" "rar" "7z" "iso" "dmg"
    # Fonts
    "ttf" "otf" "woff" "woff2" "eot"
    # Documents
    "pdf" "doc" "docx" "xls" "xlsx" "ppt" "pptx" "odt" "ods" "odp"
)

# --- Parameterized Ignores (Read from Environment Variables) ---
# Expecting comma-separated strings, I.e, "node_modules,dist,build"

# Read parameters or use empty string if not set
param_ignore_dirs_csv="${PARAM_IGNORE_DIRS:-}"
param_ignore_filenames_csv="${PARAM_IGNORE_FILENAMES:-}"
param_ignore_exts_csv="${PARAM_IGNORE_EXTS:-}"
param_ignore_env_patterns="${PARAM_IGNORE_ENV_PATTERNS:-.env*}" # Default to '.env*' if not provided

# --- Combine Internal and Parameterized Ignores ---

# Convert comma-separated strings to arrays and merge with internal ignores
# Using process substitution and mapfile/readarray for robust parsing

# Directories
declare -a ignore_dirs_final=()
mapfile -t tmp_dirs < <(echo "$param_ignore_dirs_csv" | tr ',' '\n')
ignore_dirs_final=("${INTERNAL_IGNORE_DIRS[@]}" "${tmp_dirs[@]}")
# Remove empty elements that might result from empty strings or trailing commas
for i in "${!ignore_dirs_final[@]}"; do
  [[ -z "${ignore_dirs_final[i]}" ]] && unset "ignore_dirs_final[i]"
done
# Uncomment to debug final list:
# echo "Final Ignore Dirs:" >&2; declare -p ignore_dirs_final >&2

# Filenames
declare -a ignore_filenames_final=()
mapfile -t tmp_filenames < <(echo "$param_ignore_filenames_csv" | tr ',' '\n')
ignore_filenames_final=("${INTERNAL_IGNORE_FILENAMES[@]}" "${tmp_filenames[@]}")
for i in "${!ignore_filenames_final[@]}"; do
  [[ -z "${ignore_filenames_final[i]}" ]] && unset "ignore_filenames_final[i]"
done
# Uncomment to debug final list:
# echo "Final Ignore Filenames:" >&2; declare -p ignore_filenames_final >&2


# Extensions (convert to lowercase)
declare -a ignore_exts_final=()
mapfile -t tmp_exts < <(echo "$param_ignore_exts_csv" | tr ',' '\n' | tr '[:upper:]' '[:lower:]')
# Also convert internal extensions to lowercase for consistency
mapfile -t lower_internal_exts < <(printf "%s\n" "${INTERNAL_IGNORE_EXTS[@]}" | tr '[:upper:]' '[:lower:]')
ignore_exts_final=("${lower_internal_exts[@]}" "${tmp_exts[@]}")
for i in "${!ignore_exts_final[@]}"; do
  [[ -z "${ignore_exts_final[i]}" ]] && unset "ignore_exts_final[i]"
done
# Uncomment to debug final list:
# echo "Final Ignore Exts:" >&2; declare -p ignore_exts_final >&2

# --- Functions ---

# Function to determine if a file or directory path should be ignored.
# Input: path (string)
# Output: Exits with 0 (Bash success = true) if it should be ignored, 1 otherwise.
should_ignore() {
    local path="$1"
    local filename
    filename=$(basename "$path") # Get the filename itself
    local lower_ext # For case-insensitive extension check

    # 1. Check ignored directories
    for dir in "${ignore_dirs_final[@]}"; do
        # Check if the path contains "/<dir>/" or starts with "./<dir>/" or is exactly "./<dir>"
        if [[ "$path" == *"/${dir}/"* || "$path" == "./${dir}/"* || "$path" == "./${dir}" ]]; then
            # echo "Ignoring '$path' due to directory '$dir'" >&2 # Debug
            return 0 # Ignore
        fi
    done

    # 2. Check ignored specific filenames
    for ignore_name in "${ignore_filenames_final[@]}"; do
        if [[ "$filename" == "$ignore_name" ]]; then
            # echo "Ignoring '$path' due to filename '$ignore_name'" >&2 # Debug
            return 0 # Ignore
        fi
    done

    # 3. Check for environment file patterns (I.e, .env*) if provided
    if [[ -n "$param_ignore_env_patterns" && "$filename" == $param_ignore_env_patterns ]]; then
         # echo "Ignoring '$path' due to pattern '$param_ignore_env_patterns'" >&2 # Debug
        return 0 # Ignore
    fi

    # 4. Check ignored extensions (case-insensitive)
    if [[ "$filename" == *.* ]]; then # Check if filename has an extension
      local ext="${filename##*.}"
      # Skip check if extension is empty (I.e file is '.something')
      if [[ -n "$ext" ]]; then
          lower_ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]') # Convert extension to lowercase
          for ignore_ext in "${ignore_exts_final[@]}"; do
              if [[ "$lower_ext" == "$ignore_ext" ]]; then
                  # echo "Ignoring '$path' due to extension '$ignore_ext'" >&2 # Debug
                  return 0 # Ignore
              fi
          done
      fi
    fi

    # If none of the above matched, do not ignore
    return 1 # Do not ignore
}

# --- Main Logic ---

echo "Flattening repository..."
echo "Output file: $OUTPUT_FILE"
echo "Using parameterized ignores..."

# Ensure the output directory exists (if OUTPUT_FILE includes a path)
output_dir=$(dirname "$OUTPUT_FILE")
if [[ "$output_dir" != "." ]]; then
  mkdir -p "$output_dir"
fi

# Clean the output file before starting
echo "Cleaning/creating output file: $OUTPUT_FILE"
> "$OUTPUT_FILE"

processed_count=0
ignored_count=0

# Find all files (-type f) starting from the current directory (.)
# Exclude the output file itself from being processed
# Use -print0 for safe handling of filenames with special characters
# Use process substitution < <(...) to feed find results into the while loop
while IFS= read -r -d '' file; do
    # Normalize path prefix (remove leading ./)
    normalized_file="${file#./}"

    # Skip the output file itself and files within the .github directory
    if [[ "$normalized_file" == "$OUTPUT_FILE" || "$normalized_file" == ".github/"* ]]; then
        # echo "Skipping internal file: $normalized_file" >&2 # Debug
        ignored_count=$((ignored_count + 1))
        continue
    fi

    # Check if the file should be ignored using the function
    if ! should_ignore "$file"; then
        # echo "Processing: $file" >&2 # Verbose logging
        # Append a header indicating the file path
        echo "========== file: $file ==========" >> "$OUTPUT_FILE"
        # Append the file content. Handle potential errors during cat.
        if ! cat "$file" >> "$OUTPUT_FILE"; then
          echo "Warning: Could not read file '$file'. Skipping content." >&2
          echo "[Content unavailable - read error]" >> "$OUTPUT_FILE"
        fi
        # Append a newline for separation between files
        echo >> "$OUTPUT_FILE" # Appends a single newline
        processed_count=$((processed_count + 1))
    else
        # echo "Ignoring: $file" >&2 # Debug ignored files
        ignored_count=$((ignored_count + 1))
    fi
done < <(find . -type f -print0)

echo "--------------------------------------------------"
echo "Processing complete."
echo "  Files processed: $processed_count"
echo "  Files ignored:   $ignored_count"
echo "  Flattened file generated: $OUTPUT_FILE"
echo "--------------------------------------------------"

exit 0
