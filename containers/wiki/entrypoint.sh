#!/bin/sh

if [ ! -d "/kiwix-data" ]; then
    echo "Error: /kiwix-data directory does not exist"
    exit 1
fi

generate_library_xml() {
    {   
        if [ -z "$1" ]; then
            echo "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"
            echo "<library version=\"20110515\">"
            echo "    <book id=\"waiting\">"
            echo "        <title>Waiting for Content</title>"
            echo "        <description>Please wait while content is being downloaded</description>"
            echo "        <language>eng</language>"
            echo "        <creator>System</creator>"
            echo "        <date>2025</date>"
            echo "        <url>http://wiki.root</url>"
            echo "    </book>"
            echo "</library>"
        else
            # Create empty library for kiwix-manage
            echo "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" > /tmp/temp.xml
            echo "<library version=\"20110515\">" >> /tmp/temp.xml
            echo "</library>" >> /tmp/temp.xml
            
            for zimfile in $1; do
                filename=$(basename "$zimfile")
                id="${filename%.*}"
                echo "Processing $filename..." >&2
                
                ./kiwix-manage /tmp/temp.xml add "$zimfile"
                
                # Extract all book entries except the first and last lines (library tags)
                sed -n '/<book/,/<\/book>/p' /tmp/temp.xml
            done
            rm -f /tmp/temp.xml
        fi
    } > /tmp/library.xml.new
}

update_and_restart() {
    echo "Checking for ZIM files..."
    # Find ZIM files modified more than 5 minutes ago
    NEW_ZIM_FILES=$(find /kiwix-data -name "*.zim" -type f -mmin +5 | tr '\n' ' ')
    
    echo "Generating new library.xml..."
    generate_library_xml "$NEW_ZIM_FILES"
    
    if ! cmp -s /tmp/library.xml.new /tmp/library.xml; then
        echo "Library content changed, updating..."
        
        # First move the new library file to a temporary location
        mv /tmp/library.xml.new /tmp/library.xml.tmp
        
        # If kiwix is running, stop it gracefully
        if [ -f /tmp/kiwix.pid ]; then
            pid=$(cat /tmp/kiwix.pid)
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping kiwix-serve..."
                kill "$pid"
                # Wait for process to stop
                for i in $(seq 1 30); do
                    if ! kill -0 "$pid" 2>/dev/null; then
                        break
                    fi
                    sleep 1
                done
                # Force kill if still running
                if kill -0 "$pid" 2>/dev/null; then
                    kill -9 "$pid"
                fi
            fi
            rm /tmp/kiwix.pid
        fi
        
        # Now it's safe to update the library file
        mv /tmp/library.xml.tmp /tmp/library.xml
        
        echo "Starting new kiwix-serve instance..."
        ./kiwix-serve --verbose --port 8080 --library /tmp/library.xml & echo $! > /tmp/kiwix.pid
        # Give kiwix time to start
        sleep 2
    else
        echo "No changes in library content"
        rm /tmp/library.xml.new
    fi
}

# Initial run - only include files modified more than 5 minutes ago
ZIM_FILES=$(find /kiwix-data -name "*.zim" -type f -mmin +5 | tr '\n' ' ')
echo "Generating initial library.xml..."
generate_library_xml "$ZIM_FILES"
mv /tmp/library.xml.new /tmp/library.xml

echo "Starting kiwix-serve..."
./kiwix-serve --verbose --port 8080 --library /tmp/library.xml & echo $! > /tmp/kiwix.pid
# Give kiwix time to start
sleep 2

while true; do
    sleep 240
    update_and_restart
done