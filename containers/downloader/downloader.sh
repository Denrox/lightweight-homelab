#!/bin/bash

SOURCE_URL=""
DEST_DIR=""
PATH_PATTERN=""
LATEST_ONLY=false

print_usage() {
    echo "Usage: $0 --source <source_url> --dest <destination_folder> [--pattern <path_pattern>] [--latest]"
    echo "Example: $0 --source https://download.docker.com/linux/ --dest ./data/files/download.docker.com --pattern 'ubuntu/*/amd64' --latest"
    echo
    echo "Parameters:"
    echo "  --source, -s    Source URL to download from"
    echo "  --dest, -d      Destination folder for downloads"
    echo "  --pattern, -p   Optional path pattern to filter files (e.g., 'ubuntu/*/amd64')"
    echo "  --latest, -l    Download only the latest version of matching files"
    echo "  --help, -h      Show this help message"
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_URL="${2%/}"
            shift 2
            ;;
        -d|--dest)
            DEST_DIR="${2%/}"
            shift 2
            ;;
        -p|--pattern)
            PATH_PATTERN="$2"
            shift 2
            ;;
        -l|--latest)
            LATEST_ONLY=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown parameter: $1"
            print_usage
            exit 1
            ;;
    esac
done

if [ -z "$SOURCE_URL" ] || [ -z "$DEST_DIR" ]; then
    echo "Error: Both source and destination parameters are required"
    print_usage
    exit 1
fi

if ! command -v wget &> /dev/null; then
    echo "Error: wget is not installed. Please install it first."
    exit 1
fi

mkdir -p "$DEST_DIR"

# Function to check if path matches pattern
matches_pattern() {
    local path="$1"
    local pattern="$2"
    
    if [ -z "$pattern" ]; then
        # If no pattern specified, accept all paths
        return 0
    fi
    
    # Convert glob pattern to regex pattern
    # Replace * with .* and escape special characters
    local regex_pattern="${pattern//\*/.*}"
    
    # Check if the path starts with the pattern
    if [[ "$path" =~ ^.*$pattern.*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to cleanup old files in a directory
cleanup_old_files() {
    local dir="$1"
    local pattern="$2"
    
    # Skip if directory doesn't exist
    [ ! -d "$dir" ] && return
    
    echo "Checking for old files in: $dir"
    
    # Find all files matching pattern in the directory
    local files=()
    local newest_file=""
    local newest_time=0
    
    while IFS= read -r -d '' file; do
        files+=("$file")
        # Get file modification time
        local file_time=$(stat -c %Y "$file")
    if [[ "$file_name" =~ $pattern ]] && (( file_time > newest_time )); then
        newest_time=$file_time
        newest_file=$file_name
    fi
    done < <(find "$dir" -type f -print0)
    
    if [ ${#files[@]} -gt 1 ] && [ -n "$newest_file" ]; then
        echo "Keeping newest file: $newest_file"
        for file in "${files[@]}"; do
            if [[ "$file" =~ $pattern ]] && [ "$file" != "$newest_file" ]; then
                echo "Removing old file: $file"
                rm "$file"
            fi
        done
    fi
}

# Function to download files recursively
download_recursive() {
    local url="$1"
    local local_dir="$2"
    
    echo "Processing directory: $url"
    
    # Local associative array for files in this directory
    declare -A local_files_by_date
    
    # Get directory listing into an array
    local items=()
    while read -r item; do
        items+=("$item")
    done < <(wget -q -nv -O - "$url" | grep -o 'href="[^"]*"' | cut -d'"' -f2)
    
    # Process each item
    for item in "${items[@]}"; do
        # Skip parent directory references
        [[ "$item" == "../" || "$item" == "./" ]] && continue
        
        # Construct full URL and local path
        full_url="${url%/}/${item#./}"
        local_path="$local_dir/${item#./}"
        
        # Get relative path from base URL for pattern matching
        relative_path=${full_url#$SOURCE_URL}
        relative_path=${relative_path#/}  # Remove leading slash
        
        if [[ "$item" == */ ]]; then
            # If it's a directory, always recurse into it
            download_recursive "$full_url" "$local_path"
        else
            # Check if path matches pattern (if specified)
            if [ -z "$PATH_PATTERN" ] || matches_pattern "$relative_path" "$PATH_PATTERN"; then
                if [ "$LATEST_ONLY" = true ]; then
                    # Get file date using wget
                    local file_date=$(wget --spider -nv -S "$full_url" 2>&1 | grep -i "last-modified" | sed 's/.*Last-Modified: //')
                    if [ -n "$file_date" ]; then
                        # Convert to timestamp for easier comparison
                        local timestamp=$(date -d "$file_date" +%s)
                        local_files_by_date["$timestamp"]="$full_url|$local_path|$local_dir"
                    fi
                else
                    # Download immediately if not using --latest
                    if [ ! -f "$local_path" ]; then
                        echo "Downloading: $full_url"
                        mkdir -p "$local_dir"
                        wget -q -nv -P "$local_dir" "$full_url" || \
                        echo "Failed to download: $full_url"
                    else
                        echo "File already exists: $local_path"
                    fi
                fi
            fi
        fi
    done

    # Process latest files in this directory if needed
    if [ "$LATEST_ONLY" = true ] && [ ${#local_files_by_date[@]} -gt 0 ]; then
        # Find the latest timestamp
        local latest_timestamp=0
        for timestamp in "${!local_files_by_date[@]}"; do
            if (( timestamp > latest_timestamp )); then
                latest_timestamp=$timestamp
            fi
        done

        # Download the latest file
        if [ $latest_timestamp -gt 0 ]; then
            IFS='|' read -r full_url local_path local_dir <<< "${local_files_by_date[$latest_timestamp]}"
            if [ ! -f "$local_path" ]; then
                echo "Downloading latest file: $full_url"
                mkdir -p "$local_dir"
                wget -q -nv -P "$local_dir" "$full_url" || \
                echo "Failed to download: $full_url"
            else
                echo "Latest file already exists: $local_path"
            fi
        fi
    fi
}

# Start the recursive download
echo "Starting download from $SOURCE_URL to $DEST_DIR"
if [ -n "$PATH_PATTERN" ]; then
    echo "Using path pattern: $PATH_PATTERN"
fi
if [ "$LATEST_ONLY" = true ]; then
    echo "Will download only the latest version of matching files"
    # Clean up existing files before download if --latest is specified
    cleanup_old_files "$DEST_DIR" "$PATH_PATTERN"
fi

# Start the recursive process
download_recursive "$SOURCE_URL" "$DEST_DIR"

echo "Download completed"