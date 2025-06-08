FROM docker:28.2.2-dind-alpine3.22

RUN apk add --no-cache \
    dcron \
    wget \
    rsync \
    sed \
    gawk \
    gzip \
    iputils \
    xz \
    jq \
    bash

RUN touch /var/log/cron.log

CMD ["crond", "-f", "-d", "8"]