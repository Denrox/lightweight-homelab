#!/bin/bash

if ! docker compose version &> /dev/null; then
    echo "Error: docker compose must be installed"
    exit 1
fi

check_port() {
    if netstat -tuln | grep -q ":$1 "; then
        echo "Error: Port $1 is already in use"
        exit 1
    fi
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "Error: $1 must be installed"
        exit 1
    fi
}

check_command docker
check_command netstat

if ! docker compose version &> /dev/null; then
    echo "Error: docker compose must be installed"
    exit 1
fi

ARCH=$(uname -m)
case ${ARCH} in
    x86_64)
        ARCH_TAG="amd64"
        ;;
    aarch64|arm64)
        ARCH_TAG="arm64"
        ;;
    *)
        echo "Unsupported architecture: ${ARCH}"
        exit 1
        ;;
esac

USAGE="Usage: $0 --ip <ip_address> [--reg] [--dns] [--dnsport <port>]"
if [ $# -lt 1 ]; then
    echo "Error: Parameters must be provided"
    echo "$USAGE"
    echo "Example: $0 --ip 192.168.1.10 --reg --dns --dnsport 53"
    exit 1
fi

FINAL_IP=""
DOWNLOAD_REG=false
STARTUP_DNS=false
DNS_PORT="53"

while [[ $# -gt 0 ]]; do
    case $1 in
        --ip)
            FINAL_IP="$2"
            shift 2
            ;;
        --reg)
            DOWNLOAD_REG=true
            shift
            ;;
        --dns)
            STARTUP_DNS=true
            shift
            ;;
        --dnsport)
            DNS_PORT="$2"
            shift 2
            ;;
        *)
            echo "Unknown parameter: $1"
            echo "$USAGE"
            exit 1
            ;;
    esac
done

if [ "$STARTUP_DNS" = true ]; then
    check_port ${DNS_PORT}
fi

if [ -z "$FINAL_IP" ] && [ "$STARTUP_DNS" = true ]; then
    echo "Error: IP address must be provided with --ip parameter when DNS is enabled"
    echo "$USAGE"
    exit 1
fi

check_port 80
check_port 5000

DEBIAN_CRON_IMAGE="images/debian-cron-${ARCH_TAG}.tar"
if [ -f "${DEBIAN_CRON_IMAGE}" ]; then
    echo "Loading debian-cron image from ${DEBIAN_CRON_IMAGE}...";
    docker load --input "${DEBIAN_CRON_IMAGE}";
    docker tag debian-cron:12-${ARCH_TAG} debian-cron:12;
else
    echo "Error: debian-cron image file not found at ${DEBIAN_CRON_IMAGE}";
    exit 1;
fi

NGINX_IMAGE="images/nginx-1.28.0-perl-${ARCH_TAG}.tar";
if [ -f "${NGINX_IMAGE}" ]; then
    echo "Loading nginx image from ${NGINX_IMAGE}...";
    docker load --input "${NGINX_IMAGE}";
else
    echo "Error: nginx image file not found at ${NGINX_IMAGE}";
    exit 1;
fi

COREDNS_IMAGE="images/coredns-1.12.1-${ARCH_TAG}.tar";
if [ -f "${COREDNS_IMAGE}" ]; then
    echo "Loading coredns image from ${COREDNS_IMAGE}...";
    docker load --input "${COREDNS_IMAGE}";
else
    echo "Error: coredns image file not found at ${COREDNS_IMAGE}";
    exit 1;
fi

REGISTRY_IMAGE="images/registry-3.0.0-${ARCH_TAG}.tar";
if [ -f "${REGISTRY_IMAGE}" ]; then
    echo "Loading registry image from ${REGISTRY_IMAGE}...";
    docker load --input "${REGISTRY_IMAGE}";
else
    echo "Error: registry image file not found at ${REGISTRY_IMAGE}";
    exit 1;
fi

WIKI_IMAGE="images/wiki-${ARCH_TAG}.tar";
if [ -f "${WIKI_IMAGE}" ]; then
    echo "Loading wiki image from ${WIKI_IMAGE}...";
    docker load --input "${WIKI_IMAGE}";
    docker tag wiki:${ARCH_TAG} wiki:latest;

else
    echo "Error: wiki image file not found at ${WIKI_IMAGE}";
    exit 1;
fi

cd containers/downloader || exit;

if [ "$(docker ps -q -f name=downloader)" ]; then
    echo "Downloader service is already running...";
else
    echo "Starting downloader service...";
    docker compose up -d;
fi

cd ../wiki || exit;
echo "Starting wiki service...";
docker compose up -d;

cd ../registry || exit;
echo "Starting registry service...";
docker compose up -d;

cd ../nginx || exit;
echo "Starting nginx service...";
docker compose up -d;

if [ "$STARTUP_DNS" = true ]; then
    cd ../coredns || exit;
    sed -i "s/192\.168\.0\.1/${FINAL_IP}/g" config/Corefile
    sed -i "s/53\:53\/udp/${DNS_PORT}\:${DNS_PORT}\/udp/g" docker-compose.yaml
    echo "Starting coredns service...";
    docker compose up -d;
fi

cd ../../scripts || exit;

if [ "$DOWNLOAD_REG" = true ]; then
    echo "127.0.0.1 reg.root" >> /etc/hosts
    echo "Downloading docker images..."
    ./images.sh reg.root:5000
    sed -i '/127\.0\.0\.1 reg\.root/d' /etc/hosts
fi

echo "Startup completed successfully"
