FROM nginx:1.28.0-alpine

# Set working directory
WORKDIR /usr/local/nginx

# Install logrotate and cron using apk (Alpine package manager)
RUN apk update && \
    apk add --no-cache \
        logrotate \
        dcron \
        && rm -rf /var/cache/apk/*

# Copy logrotate configuration
COPY logrotate.conf /etc/logrotate.d/nginx

# Set correct permissions for logrotate configuration (root:root, 644)
RUN chown root:root /etc/logrotate.d/nginx && \
    chmod 644 /etc/logrotate.d/nginx

# Ensure nginx log directory has proper permissions
RUN mkdir -p /var/log/nginx && \
    chown root:root /var/log/nginx && \
    chmod 755 /var/log/nginx

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]