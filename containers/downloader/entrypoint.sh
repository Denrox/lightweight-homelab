#!/bin/bash

cd /usr/local/bin/scripts && ./cronscript.sh

wget -P "../data/volumes/downloader/data/files/os/ubuntu-releases" https://releases.ubuntu.com/24.04/ubuntu-24.04.2-desktop-amd64.iso
wget -P "../data/volumes/downloader/data/files/os/ubuntu-releases" https://releases.ubuntu.com/24.04/ubuntu-24.04.2-live-server-amd64.iso
wget -P "../data/volumes/downloader/data/files/os/debian-releases" https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.11.0-amd64-netinst.iso
wget -P "../data/volumes/downloader/data/files/os/proxmox-releases" https://enterprise.proxmox.com/iso/proxmox-ve_8.4-1.iso

cron

tail -f /var/log/cron.log