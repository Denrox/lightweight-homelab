#!/bin/bash

docker buildx create --name multiarch --use || true

echo "Building amd64 image..."
docker buildx build --platform linux/amd64 \
  -t docker:28.2.2-dind-alpine3.22-amd64 \
  -f base.Dockerfile \
  --load .

echo "Building arm64 image..."
docker buildx build --platform linux/arm64 \
  -t docker:28.2.2-dind-alpine3.22-arm64 \
  -f base.Dockerfile \
  --load .

echo "Building armv7 image..."
docker buildx build --platform linux/arm/v7 \
  -t docker:28.2.2-dind-alpine3.22-armv7 \
  -f base.Dockerfile \
  --load .

echo "Exporting amd64 image..."
docker save docker:28.2.2-dind-alpine3.22-amd64 > ../../images/docker:28.2.2-dind-alpine3.22-amd64.tar

echo "Exporting arm64 image..."
docker save docker:28.2.2-dind-alpine3.22-arm64 > ../../images/docker:28.2.2-dind-alpine3.22-arm64.tar

echo "Exporting armv7 image..."
docker save docker:28.2.2-dind-alpine3.22-armv7 > ../../images/docker:28.2.2-dind-alpine3.22-armv7.tar

echo "Base images have been created and exported to docker:28.2.2-dind-alpine3.22-amd64.tar and docker:28.2.2-dind-alpine3.22-arm64.tar and docker:28.2.2-dind-alpine3.22-armv7.tar"

docker buildx rm multiarch
docker buildx use default

echo "Buildx builder has been removed"