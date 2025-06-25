#!/bin/bash

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

DOWNLOAD_MIRROR=${DOWNLOAD_MIRROR:-}

DOWNLOADER_IMAGE="../../images/downloader-${ARCH_TAG}.tar"
if [ -f "${DOWNLOADER_IMAGE}" ]; then
    echo "Loading downloader image from ${DOWNLOADER_IMAGE}...";
    docker load --input "${DOWNLOADER_IMAGE}";
    docker tag downloader:${ARCH_TAG} downloader:latest;
else
    echo "Error: downloader image file not found at ${DOWNLOADER_IMAGE}";
    exit 1;
fi

if [ "$(docker ps -q -f name=downloader)" ]; then
    echo "Downloader service is already running...";
else
    echo "Starting downloader service...";
    export DOWNLOAD_MIRROR
    docker compose up -d;
fi