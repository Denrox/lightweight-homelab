#!/bin/bash

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t nginx:1.28.0-amd64 \
  -f Dockerfile \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t nginx:1.28.0-arm64 \
  -f Dockerfile \
  --load .

echo "Building armv7 image..."
docker buildx build --platform linux/arm/v7 \
  -t nginx:1.28.0-armv7 \
  -f Dockerfile \
  --load .

echo "Exporting amd64 image..."
docker save nginx:1.28.0-amd64 > ../../images/nginx-1.28.0-amd64.tar

echo "Exporting arm64 image..."
docker save nginx:1.28.0-arm64 > ../../images/nginx-1.28.0-arm64.tar

echo "Exporting armv7 image..."
docker save nginx:1.28.0-armv7 > ../../images/nginx-1.28.0-armv7.tar

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"