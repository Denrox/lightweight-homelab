FROM debian-cron:12

RUN apt-get update && \
    apt-get install -y \
    curl \
    ca-certificates \
    gnupg && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/bin/scripts

COPY downloader.sh mirror-rsync.sh entrypoint.sh cronscript.sh /usr/local/bin/scripts/
RUN chmod +x /usr/local/bin/scripts/*.sh
RUN echo "0 0 */3 * * cd /usr/local/bin/scripts && ./cronscript.sh" > /etc/cron.d/downloader-cron \
    && chmod 0644 /etc/cron.d/downloader-cron \
    && crontab /etc/cron.d/downloader-cron

WORKDIR /usr/local/bin/scripts

ENTRYPOINT ["./entrypoint.sh"]