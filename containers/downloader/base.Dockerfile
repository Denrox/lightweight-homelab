FROM 28.2.2-dind-alpine3.22

RUN apt-get update && apt-get install -y \
    cron \
    wget \
    rsync \
    sed \
    gawk \
    gzip \
    iputils-ping \
    xz-utils \
    jq \
    && rm -rf /var/lib/apt/lists/*

RUN touch /var/log/cron.log

CMD ["cron", "-f"]