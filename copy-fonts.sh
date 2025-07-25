#!/bin/bash

# Script to copy font files to the public/fonts directory
# Usage: ./copy-fonts.sh /path/to/your/font/files

if [ $# -eq 0 ]; then
    echo "Usage: $0 /path/to/your/font/files"
    echo "Example: $0 ~/Downloads/my-fonts/"
    exit 1
fi

SOURCE_DIR="$1"
TARGET_DIR="public/fonts"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy font files
echo "Copying font files from $SOURCE_DIR to $TARGET_DIR..."
cp "$SOURCE_DIR"/*.{woff,woff2,ttf,otf} "$TARGET_DIR/" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Font files copied successfully!"
    echo "Files in $TARGET_DIR:"
    ls -la "$TARGET_DIR"
else
    echo "No font files found or error copying files."
    echo "Please make sure your font files have extensions: .woff, .woff2, .ttf, or .otf"
fi 