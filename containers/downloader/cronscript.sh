#!/bin/bash

LOG_DATE=$(date +%Y-%m-%d)
LOG_FILE="/logs/${LOG_DATE}.log"

cd /logs || exit
ls -t | tail -n +11 | xargs -r rm

exec 1> >(tee -a "${LOG_FILE}")
exec 2>&1

echo "=== Download started at $(date) ==="

if ! ping -c 1 google.com &> /dev/null && ! ping -c 1 cloudflare.com &> /dev/null; then
    echo "No internet connection available. Skipping downloads."
    exit 0
fi

download_if_not_exists() {
    local target_dir="$1"
    local url="$2"
    local filename=$(basename "$url")
    local full_path="$target_dir/$filename"

    if [ ! -f "$full_path" ]; then
        wget -P "$target_dir" "$url"
    fi
}

cd /usr/local/bin/scripts

CONFIG_FILE="/config/downloads.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

# Process all downloads
echo "Processing downloads..."
jq -r '.downloads[] | select(.type == "direct") | "\(.url)|\(.dest)"' "$CONFIG_FILE" | while IFS='|' read -r url dest; do
    download_if_not_exists "$dest" "$url"
done

jq -r '.downloads[] | select(.type == "pattern") | "\(.url)|\(.dest)|\(.pattern)|\(.latest)"' "$CONFIG_FILE" | while IFS='|' read -r url dest pattern latest; do
    latest_flag=""
    if [ "$latest" = "true" ]; then
        latest_flag="--latest"
    fi
    ./downloader.sh --source "$url" --dest "$dest" --pattern "$pattern" $latest_flag
    sleep 10
done

# Run mirror-rsync at the end
./mirror-rsync.sh

echo "=== Download completed at $(date) ==="
