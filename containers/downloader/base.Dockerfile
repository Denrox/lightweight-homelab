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

RUN touch /var/log/cron.log

CMD ["cron", "-f"]