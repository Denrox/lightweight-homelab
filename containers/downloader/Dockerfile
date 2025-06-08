FROM debian:12

# Install dependencies and Docker
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gpg \
    cron \
    wget \
    rsync \
    sed \
    gawk \
    gzip \
    iputils-ping \
    xz-utils \
    jq \
    iptables \
    openssl \
    pigz \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Docker
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin \
    && rm -rf /var/lib/apt/lists/*

# Install Docker daemon configuration
COPY daemon.json /etc/docker/daemon.json
RUN mkdir -p /etc/docker /usr/local/bin/scripts /etc/cron.d /var/log

# Copy and setup scripts
COPY downloader.sh mirror-rsync.sh entrypoint.sh cronscript.sh /usr/local/bin/scripts/
RUN chmod +x /usr/local/bin/scripts/*.sh
RUN echo "0 0 * * * cd /usr/local/bin/scripts && ./cronscript.sh" > /etc/cron.d/downloader-cron \
    && chmod 0644 /etc/cron.d/downloader-cron \
    && crontab /etc/cron.d/downloader-cron

WORKDIR /usr/local/bin/scripts

VOLUME /var/lib/docker

ENTRYPOINT ["./entrypoint.sh"]