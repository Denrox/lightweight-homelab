#!/bin/bash

sleep 10

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