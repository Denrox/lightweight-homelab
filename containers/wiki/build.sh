#!/bin/bash

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t wiki:amd64 \
  -f Dockerfile \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t wiki:arm64 \
  -f Dockerfile \
  --load .

echo "Building armv7 image..."
docker buildx build --platform linux/arm/v7 \
  -t wiki:armv7 \
  -f Dockerfile \
  --load .

echo "Exporting amd64 image..."
docker save wiki:amd64 > ../../images/wiki-amd64.tar

echo "Exporting arm64 image..."
docker save wiki:arm64 > ../../images/wiki-arm64.tar

echo "Exporting armv7 image..."
docker save wiki:armv7 > ../../images/wiki-armv7.tar

echo "Base images have been created and exported to wiki-amd64.tar and wiki-arm64.tar and wiki-armv7.tar"

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"