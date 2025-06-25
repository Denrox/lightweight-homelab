#!/bin/bash

# Lock file setup
LOCK_FILE="/tmp/cronscript.lock"

if [ -e "$LOCK_FILE" ]; then
    if [ $(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") )) -gt 57600 ]; then
        echo "Lock file is older than 24 hours. Removing stale lock and continuing."
        rm -f "$LOCK_FILE"
    elif kill -0 $(cat "$LOCK_FILE") 2>/dev/null; then
        echo "Another instance is already running. Exiting."
        exit 1
    else
        # Stale lock file
        rm -f "$LOCK_FILE"
    fi
fi

# Store current PID in lock file
echo $$ > "$LOCK_FILE"

# Clean up lock file on exit
trap 'rm -f "$LOCK_FILE"' EXIT

# Save original directory
ORIGINAL_DIR=$(pwd)

LOG_DATE=$(date +%Y-%m-%d)
LOG_FILE="/logs/${LOG_DATE}.log"

cd /logs || exit
ls -t | tail -n +11 | xargs -r rm

# Return to original directory
cd "$ORIGINAL_DIR" || exit

exec 1> >(tee -a "${LOG_FILE}")
exec 2>&1

echo "=== Download started at $(date) ==="

if ! ping -c 1 google.com &> /dev/null && ! ping -c 1 cloudflare.com &> /dev/null; then
    echo "No internet connection available. Skipping downloads."
    exit 0
fi

CONFIG_FILE="/config/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

MIRRORS_ENABLED=$(jq -r '.mirrors' "$CONFIG_FILE")
if [ "$MIRRORS_ENABLED" = "true" ]; then
    echo "Mirrors enabled, running mirror-rsync script..."
    ./mirror-rsync.sh
else
    echo "Mirrors disabled, skipping mirror-rsync"
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

mirror_docker_image() {
    local image="$1"
    local namespace="$2"
    local registry_url="registry:5000"
    local architectures=("amd64" "arm64" "arm/v7")
    local alt_registries=(
        "mirror.gcr.io/library/"
        "quay.io/library/"
        ""  # Empty string for Docker Hub
    )
    
    echo "Processing Docker image: $image from namespace: $namespace"
    
    tags="$(wget -q -O - "https://hub.docker.com/v2/namespaces/$namespace/repositories/$image/tags?page_size=25" | grep -o '"name": *"[^"]*' | grep -o '[^"]*$')"
    
    tag_count=0
    while IFS= read -r line; do
        if [ $tag_count -ge 2 ]; then
            break
        fi

        if [[ "$line" =~ ^[0-9]{1,2}\.[0-9]{1,2} ]]; then
            for arch in "${architectures[@]}"; do
                echo "Processing $image:$line for $arch"
                
                tagname="$namespace/$image:$line"
                if [ "$namespace" = "library" ]; then
                    tagname="$image:$line"
                fi
                
                # Try pulling from alternative registries first
                pull_success=0
                for registry in "${alt_registries[@]}"; do
                    if [ -n "$registry" ]; then
                        if docker pull --platform "linux/$arch" "${registry}${image}:${line}" &> /dev/null; then
                            tagname="${registry}${image}:${line}"
                            pull_success=1
                            echo "Successfully pulled from $registry"
                            break
                        fi
                    fi
                done

                # If all alternative registries failed, try Docker Hub
                if [ $pull_success -eq 0 ]; then
                    if ! docker pull --platform "linux/$arch" $tagname &> /dev/null; then
                        echo "Failed to pull $tagname for $arch from all registries, skipping..."
                        continue
                    fi
                fi
                
                desttagname="$registry_url/$image:$line-${arch//\//-}"
                docker tag $tagname $desttagname
                
                docker push $desttagname &> /dev/null
                echo "pushed $desttagname"
                
                docker rmi $tagname $desttagname &> /dev/null
                sleep 10
            done
            ((tag_count++))
        fi
    done <<< "$tags"
}

cd /usr/local/bin/scripts

CONFIG_FILE="/config/downloads.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

# Process direct downloads
echo "Processing direct downloads..."
jq -r '.downloads[] | select(.type == "direct") | "\(.url)|\(.dest)"' "$CONFIG_FILE" | while IFS='|' read -r url dest; do
    download_if_not_exists "$dest" "$url"
done

# Process pattern downloads
echo "Processing pattern downloads..."
jq -r '.downloads[] | select(.type == "pattern") | "\(.url)|\(.dest)|\(.pattern)|\(.latest)"' "$CONFIG_FILE" | while IFS='|' read -r url dest pattern latest; do
    latest_flag=""
    if [ "$latest" = "true" ]; then
        latest_flag="--latest"
    fi
    ./downloader.sh --source "$url" --dest "$dest" --pattern "$pattern" $latest_flag
    sleep 10
done

# Process Docker image mirroring
echo "Processing Docker image mirroring..."

jq -r '.downloads[] | select(.type == "docker") | "\(.image)|\(.namespace)"' "$CONFIG_FILE" | while IFS='|' read -r image namespace; do
    mirror_docker_image "$image" "$namespace"
done

echo "=== Download completed at $(date) ==="
