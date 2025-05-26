#!/bin/bash

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t debian-cron:12-amd64 \
  -f base.Dockerfile \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t debian-cron:12-arm64 \
  -f base.Dockerfile \
  --load .

echo "Exporting amd64 image..."
docker save debian-cron:12-amd64 > ../../images/debian-cron-amd64.tar

echo "Exporting arm64 image..."
docker save debian-cron:12-arm64 > ../../images/debian-cron-arm64.tar

echo "Base images have been created and exported to debian-cron-amd64.tar and debian-cron-arm64.tar"

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"