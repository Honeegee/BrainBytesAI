#!/bin/bash

# Usage: node make-executable.js <script-path>
# Makes a shell script executable using chmod +x

if [ -z "$1" ]; then
  echo "Usage: $0 <script-path>"
  exit 1
fi

SCRIPT_PATH="$1"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: Script file not found: $SCRIPT_PATH"
  exit 1
fi

chmod +x "$SCRIPT_PATH"
echo "Made $SCRIPT_PATH executable"
