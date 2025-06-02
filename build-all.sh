#!/bin/bash

if [ "$(uname -m)" != "x86_64" ]; then
    echo "Error: Build images must be run on amd64/x86_64 architecture"
    exit 1
fi

if ! ping -c 1 google.com &> /dev/null && ! ping -c 1 cloudflare.com &> /dev/null; then
    echo "Error: Internet connection must be available for building images"
    exit 1
fi

if ! docker buildx version &> /dev/null; then
    echo "Error: Docker Buildx plugin need to be present for building images"
    exit 1
fi

mkdir -p images

echo "Pulling registry:3.0.0 for amd64..."
docker pull --platform linux/amd64 registry:3.0.0
docker save registry:3.0.0 > images/registry-3.0.0-amd64.tar

echo "Pulling registry:3.0.0 for arm64..."
docker pull --platform linux/arm64 registry:3.0.0
docker save registry:3.0.0 > images/registry-3.0.0-arm64.tar

echo "Pulling nginx:1.28.0-perl for amd64..."
docker pull --platform linux/amd64 nginx:1.28.0-perl
docker save nginx:1.28.0-perl > images/nginx-1.28.0-perl-amd64.tar

echo "Pulling nginx:1.28.0-perl for arm64..."
docker pull --platform linux/arm64 nginx:1.28.0-perl
docker save nginx:1.28.0-perl > images/nginx-1.28.0-perl-arm64.tar

echo "Pulling gogs:0.13 for amd64..."
docker pull --platform linux/amd64 gogs/gogs:0.13-amd64
docker save gogs/gogs:0.13-amd64 > images/gogs-0.13-amd64.tar

echo "Pulling gogs:0.13 for arm64..."
docker pull --platform linux/arm64 gogs/gogs:0.13-arm64
docker save gogs/gogs:0.13-arm64 > images/gogs-0.13-arm64.tar

echo "Pulling coredns/coredns:1.12.1 for arm64..."
docker pull --platform linux/arm64 coredns/coredns:1.12.1
docker save coredns/coredns:1.12.1 > images/coredns-1.12.1-arm64.tar

echo "Pulling coredns/coredns:1.12.1 for amd64..."
docker pull --platform linux/amd64 coredns/coredns:1.12.1
docker save coredns/coredns:1.12.1 > images/coredns-1.12.1-amd64.tar

# Find and execute build.sh in each container directory
for dir in containers/*/; do
    if [ -f "${dir}build.sh" ]; then
        echo "Building images in ${dir}..."
        cd "${dir}" || exit
        ./build.sh
        cd - || exit
        echo "Finished building images in ${dir}"
    fi
done

echo "All images have been built"