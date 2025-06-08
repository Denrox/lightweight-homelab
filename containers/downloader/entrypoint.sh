#!/bin/bash

# Start the Docker daemon with TLS enabled
dockerd-entrypoint.sh dockerd &

# Wait for Docker daemon to be ready
until docker info > /dev/null 2>&1; do
    echo "Waiting for Docker daemon..."
    sleep 1
done

cd /usr/local/bin/scripts && ./cronscript.sh

crond -f -d 8 &

tail -f /var/log/cron.log