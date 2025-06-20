#!/bin/sh
set -e

# Create logrotate state directory if it doesn't exist
mkdir -p /var/lib/logrotate

# Set up logrotate cron job to run daily at midnight
echo "0 0 * * * /usr/sbin/logrotate /etc/logrotate.conf" | crontab -

# Start cron daemon in background
crond

# Test logrotate configuration
logrotate -d /etc/logrotate.d/nginx

echo "Logrotate configured and cron started"

# Start nginx in foreground
exec nginx -g "daemon off;" 