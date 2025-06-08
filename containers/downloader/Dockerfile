FROM docker:28.2.2-dind

RUN apt-get update && apt-get install -y \
    cron \
    wget \
    rsync \
    sed \
    curl \
    gawk \
    gzip \
    iputils-ping \
    xz-utils \
    jq \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/bin/scripts /etc/cron.d /var/log

COPY downloader.sh mirror-rsync.sh entrypoint.sh cronscript.sh /usr/local/bin/scripts/
RUN chmod +x /usr/local/bin/scripts/*.sh
RUN echo "0 0 * * * cd /usr/local/bin/scripts && ./cronscript.sh" > /etc/cron.d/downloader-cron \
    && chmod 0644 /etc/cron.d/downloader-cron \
    && crontab /etc/cron.d/downloader-cron

WORKDIR /usr/local/bin/scripts

ENTRYPOINT ["./entrypoint.sh"]