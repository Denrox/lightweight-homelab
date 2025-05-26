#!/bin/sh

if [ ! -d "/kiwix-data" ]; then
    echo "Error: /kiwix-data directory does not exist"
    exit 1
fi

ZIM_FILES=$(find /kiwix-data -name "*.zim" -type f | tr '\n' ' ')

if [ -z "$ZIM_FILES" ]; then
    echo "No .zim files found in /kiwix-data"
    exit 1
fi

for file in $ZIM_FILES; do
    if [ ! -r "$file" ]; then
        echo "Error: Cannot read ZIM file: $file"
        exit 1
    fi
    echo "Found readable ZIM file: $file"
done

echo "Starting kiwix-serve..."

exec ./kiwix-serve --verbose --port 8080 $ZIM_FILES