#!/bin/sh

if [ ! -d "/kiwix-data" ]; then
    echo "Error: /kiwix-data directory does not exist"
    exit 1
fi

generate_library_xml() {
    if [ -z "$1" ]; then
        {   
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
        } > /tmp/library.xml.new
    else
        {
            echo "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"
            echo "<library version=\"20110515\">"
            echo "</library>"
        } > /tmp/library.xml.new
        
        for zimfile in $1; do
            filename=$(basename "$zimfile")
            echo "Processing $filename..." >&2
            ./kiwix-manage /tmp/library.xml.new add "$zimfile"
        done
    fi
}

update_and_restart() {
    echo "Checking for ZIM files..."
    # Find ZIM files modified more than 5 minutes ago
    NEW_ZIM_FILES=$(find /kiwix-data -name "*.zim" -type f -mmin +5 | tr '\n' ' ')
    
    echo "Generating new library.xml..."
    generate_library_xml "$NEW_ZIM_FILES"
    
    if ! cmp -s /tmp/library.xml.new /tmp/library.xml; then
        echo "Library content changed, updating..."
        
        mv /tmp/library.xml.new /tmp/library.xml.tmp
        
        if [ -f /tmp/kiwix.pid ]; then
            pid=$(cat /tmp/kiwix.pid)
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping kiwix-serve..."
                kill "$pid"
                for i in $(seq 1 30); do
                    if ! kill -0 "$pid" 2>/dev/null; then
                        break
                    fi
                    sleep 1
                done
                if kill -0 "$pid" 2>/dev/null; then
                    kill -9 "$pid"
                fi
            fi
            rm /tmp/kiwix.pid
        fi
        
        mv /tmp/library.xml.tmp /tmp/library.xml
        
        echo "Starting new kiwix-serve instance..."
        ./kiwix-serve --verbose --port 8080 --library /tmp/library.xml & echo $! > /tmp/kiwix.pid
        sleep 2
    else
        echo "No changes in library content"
        rm /tmp/library.xml.new
    fi
}

ZIM_FILES=$(find /kiwix-data -name "*.zim" -type f -mmin +5 | tr '\n' ' ')
echo "Generating initial library.xml..."
generate_library_xml "$ZIM_FILES"
mv /tmp/library.xml.new /tmp/library.xml

echo "Starting kiwix-serve..."
./kiwix-serve --verbose --port 8080 --library /tmp/library.xml & echo $! > /tmp/kiwix.pid
sleep 2

while true; do
    sleep 240
    update_and_restart
done