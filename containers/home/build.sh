#!/bin/bash

# Get the script's directory
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Change to the script directory and stay there
cd "$SCRIPT_DIR"

# Build on host machine first
npm ci
npm run build

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t home:amd64 \
  -f Dockerfile \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t home:arm64 \
  -f Dockerfile \
  --load .

echo "Building armv7 image..."
docker buildx build --platform linux/arm/v7 \
  -t home:armv7 \
  -f Dockerfile \
  --load .

echo "Exporting amd64 image..."
docker save home:amd64 > ../../images/home-amd64.tar

echo "Exporting arm64 image..."
docker save home:arm64 > ../../images/home-arm64.tar

echo "Exporting armv7 image..."
docker save home:armv7 > ../../images/home-armv7.tar

echo "Base images have been created and exported to home-amd64.tar, home-arm64.tar and home-armv7.tar"

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"