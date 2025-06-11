# Lightweight Homelab

## Overview
This project is a lightweight homelab setup which supports arm64, amd64, and armv7 architectures. This homelab is designed to be portable, it can be run on a usb drive and supports almost any devices with usb port, or nvme/sata port. This homelab setup will provide you with following services:
- gogs (git web interface)
- kiwix (wikipedia, with a config to automatically download and update on cron and on every startup)
- file server (with docker deb files for all architectures, also automatically updated). Also it automatically downloads os images for ubuntu, debian
- private docker registry
- ubuntu apt mirror
- coredns resolver

After you complete the setup you will get a nginx server which listens on port 80 to the following domains:
- mirror.root
- reg.root:5000
- files.root
- wiki.root
- home.root

### Build requirements
- A linux machine amd64.
- A working internet connection to download the initial images.
- Docker + Docker buildx plugin installed.

### Run requirements
- A linux machine (amd64 or arm64 or armv7) with at least 1GB of RAM.
- Docker + docker compose installed + netstat installed.
- Internet connection is required only for downloading initial data to serve (zim files, apt-mirror packages). Afterwards you can keep it offline.

## Usage instructions

### build-all.sh
This script builds all necessary Docker images and saves them as tar files. Images are build for amd64 and arm64 and armv7 architectures and saved in the `images` directory.

**How to run:**
```bash
./build-all.sh
```

### startup.sh
This scripts starts all services in docker.

**How to run:**
```bash
./startup.sh;
```

