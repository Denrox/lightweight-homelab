# Lightweight Homelab

## Overview
This project creates for you a portable set of services which will allow you to run many things without internet. It provides you with a local mirror for ubuntu apt repositories, a local registry for docker images, a local wiki (kiwix) and a local dns resolver. It also downloads for you installation images for several linux distributions. It also keeps you local apt-mirror and kiwix library up to date.

After you complete the setup you will get a nginx server which listens on port 80 to the following domains:
- mirror.root
- reg.root:5000
- files.root
- wiki.root

### Build requirements
- A linux machine amd64.
- A working internet connection to download the initial images.
- Docker + Docker buildx plugin installed.

### Run requirements
- A linux machine (amd64 or arm64) with at least 1GB of RAM.
- Docker + docker compose installed + netstat installed.
- Internet connection is required only for downloading initial data to serve (zim files, apt-mirror packages). Afterwards you can keep it offline.

## Usage instructions

### build-all.sh
This script builds all necessary Docker images and saves them as tar files. Images are build for amd64 and arm64 architectures and saved in the `images` directory.

**How to run:**
```bash
./build-all.sh
```

### startup.sh
This scripts starts all services in docker.

**How to run:**
```bash
./startup.sh; # Start services without dns and downloading docker images and iso images
./startup.sh --ip 192.168.0.1 --dns --dnsport 53; # Ip address on which the services are deployed and dns port
./startup.sh --ip 192.168.0.1 --dns --dnsport 53 --os --reg; # Add flags to download os images for dome linux distros and to download docker images
```

