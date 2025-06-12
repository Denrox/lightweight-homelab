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

prompt_yn() {
    local prompt="$1"
    local default="$2"
    local answer
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n]"
    else
        prompt="$prompt [y/N]"
    fi
    
    read -p "$prompt " answer
    answer=${answer:-$default}
    case "$answer" in
        [Yy]*) return 0 ;;
        *) return 1 ;;
    esac
}

check_command docker
check_command netstat

ARCH=$(uname -m)
case ${ARCH} in
    x86_64)
        ARCH_TAG="amd64"
        ;;
    aarch64|arm64)
        ARCH_TAG="arm64"
        ;;
    armv7l)
        ARCH_TAG="armv7"
        ;;
    *)
        echo "Unsupported architecture: ${ARCH}"
        exit 1
        ;;
esac

echo "Lightweight Homelab Setup"
echo "========================"
echo

# Interactive configuration
if prompt_yn "Enable DNS server?" "n"; then
    STARTUP_DNS=true
    read -p "Enter IP address: " FINAL_IP
    if [ -z "$FINAL_IP" ]; then
        echo "Error: IP address must be provided when DNS is enabled"
        exit 1
    fi
    check_port 53
else
    STARTUP_DNS=false
    FINAL_IP=""
fi
echo

if prompt_yn "Download Ubuntu APT mirror?" "n"; then
    DOWNLOAD_MIRROR=true
else
    DOWNLOAD_MIRROR=false
fi
echo

check_port 80
check_port 5000

DOWNLOADER_IMAGE="images/downloader-${ARCH_TAG}.tar"
if [ -f "${DOWNLOADER_IMAGE}" ]; then
    echo "Loading downloader image from ${DOWNLOADER_IMAGE}...";
    docker load --input "${DOWNLOADER_IMAGE}";
    docker tag downloader:${ARCH_TAG} downloader:latest;
else
    echo "Error: downloader image file not found at ${DOWNLOADER_IMAGE}";
    exit 1;
fi

HOME_IMAGE="images/home-${ARCH_TAG}.tar";
if [ -f "${HOME_IMAGE}" ]; then
    echo "Loading home image from ${HOME_IMAGE}...";
    docker load --input "${HOME_IMAGE}";
    docker tag home:${ARCH_TAG} home:latest;
else
    echo "Error: home image file not found at ${HOME_IMAGE}";
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

REGISTRY_BROWSER_IMAGE="images/docker-registry-browser-1.8.3-${ARCH_TAG}.tar";
if [ -f "${REGISTRY_BROWSER_IMAGE}" ]; then
    echo "Loading registry browser image from ${REGISTRY_BROWSER_IMAGE}...";
    docker load --input "${REGISTRY_BROWSER_IMAGE}";
else
    echo "Error: registry browser image file not found at ${REGISTRY_BROWSER_IMAGE}";
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

GOGS_IMAGE="images/gogs-0.13-${ARCH_TAG}.tar";
if [ -f "${GOGS_IMAGE}" ]; then
    echo "Loading gogs image from ${GOGS_IMAGE}...";
    docker load --input "${GOGS_IMAGE}";
    docker tag gogs/gogs:0.13-${ARCH_TAG} gogs:0.13;
else
    echo "Error: gogs image file not found at ${GOGS_IMAGE}";
    exit 1;
fi

TRILIUM_IMAGE="images/trilium-0.63.7-${ARCH_TAG}.tar";
if [ -f "${TRILIUM_IMAGE}" ]; then
    echo "Loading trilium image from ${TRILIUM_IMAGE}...";
    docker load --input "${TRILIUM_IMAGE}";
    docker tag zadam/trilium:0.63.7 trilium:0.63.7;
else
    echo "Error: trilium image file not found at ${TRILIUM_IMAGE}";
    exit 1;
fi

cd containers/downloader || exit;

if [ "$(docker ps -q -f name=downloader)" ]; then
    echo "Downloader service is already running...";
else
    echo "Starting downloader service...";
    export DOWNLOAD_MIRROR
    docker compose up -d;
fi

cd ../wiki || exit;
echo "Starting wiki service...";
docker compose up -d;

cd ../registry || exit;
echo "Starting registry service...";
# Generate random secret key
RANDOM_SECRET=$(head -c 32 /dev/urandom | base64)
sed -i "s/SECRET_KEY_BASE=some-secret-key/SECRET_KEY_BASE=$RANDOM_SECRET/" docker-compose.yaml
docker compose up -d;

cd ../gogs || exit;
echo "Starting gogs service...";
docker compose up -d;

cd ../home || exit;
echo "Starting home service...";
docker compose up -d;

cd ../trilium || exit;
echo "Starting trilium service...";
docker compose up -d;

cd ../nginx || exit;
echo "Starting nginx service...";
docker compose up -d;

if [ "$STARTUP_DNS" = true ]; then
    cd ../coredns || exit;
    sed -i "s/192\.168\.0\.1/${FINAL_IP}/g" ../../data/volumes/coredns/config/Corefile
    echo "Starting coredns service...";
    docker compose up -d;
fi

cd ../..;
echo "{\"mirrors\": ${DOWNLOAD_MIRROR}}" > data/volumes/downloader/config/config.json;

cat > containers/home/public/config.json << EOF
{
    "dns": {
        "disabled": $([[ "$STARTUP_DNS" != "true" ]] && echo "true" || echo "false"),
        "ip": "${FINAL_IP:-192.168.0.1}"
    },
    "mirror": {
        "disabled": $([[ "$DOWNLOAD_MIRROR" != "true" ]] && echo "true" || echo "false")
    }
}
EOF

echo "Startup completed successfully";
