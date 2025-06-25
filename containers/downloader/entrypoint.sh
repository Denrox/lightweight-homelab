#!/bin/bash

sleep 10

# Kill any existing Docker daemon process
if [ -f /var/run/docker.pid ]; then
    pid=$(cat /var/run/docker.pid)
    if kill -0 $pid 2>/dev/null; then
        kill -9 $pid
    fi
    sleep 2
    rm -f /var/run/docker.pid
fi

# Clean up any existing Docker socket
rm -f /var/run/docker.sock

sleep 2

# Start the Docker daemon
dockerd --pidfile /var/run/docker.pid &

# Wait for Docker daemon to be ready
until docker info > /dev/null 2>&1; do
    echo "Waiting for Docker daemon..."
    sleep 1
done

cd /usr/local/bin/scripts && ./cronscript.sh

# Create log file and directory
mkdir -p /var/log
touch /var/log/cron.log

# Start cron daemon (works for both Debian and Alpine)
/usr/sbin/cron -f &

tail -f /var/log/cron.log