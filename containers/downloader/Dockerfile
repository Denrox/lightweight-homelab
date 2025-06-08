FROM docker:28.2.2-dind-alpine3.22

RUN apk add --no-cache \
    curl \
    ca-certificates \
    cron \
    wget \
    rsync \
    sed \
    gawk \
    gzip \
    iputils \
    xz \
    jq \
    bash

RUN mkdir -p /usr/local/bin/scripts

COPY downloader.sh mirror-rsync.sh entrypoint.sh cronscript.sh /usr/local/bin/scripts/
RUN chmod +x /usr/local/bin/scripts/*.sh
RUN echo "0 0 */3 * * cd /usr/local/bin/scripts && ./cronscript.sh" > /etc/cron.d/downloader-cron \
    && chmod 0644 /etc/cron.d/downloader-cron \
    && crontab /etc/cron.d/downloader-cron

WORKDIR /usr/local/bin/scripts

ENTRYPOINT ["./entrypoint.sh"]