FROM debian:12-slim

RUN apt-get update && apt-get install -y \
    cron \
    wget \
    rsync \
    sed \
    gawk \
    gzip \
    iputils-ping \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

RUN touch /var/log/cron.log

CMD ["cron", "-f"]