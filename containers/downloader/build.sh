#!/bin/bash

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t downloader:amd64 \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t downloader:arm64 \
  --load .

echo "Building armv7 image..."
docker buildx build --platform linux/arm/v7 \
  -t downloader:armv7 \
  --load .

echo "Exporting amd64 image..."
docker save downloader:amd64 > ../../images/downloader-amd64.tar

echo "Exporting arm64 image..."
docker save downloader:arm64 > ../../images/downloader-arm64.tar

echo "Exporting armv7 image..."
docker save downloader:armv7 > ../../images/downloader-armv7.tar

echo "Base images have been created and exported to downloader-amd64.tar and downloader-arm64.tar and downloader-armv7.tar"

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"