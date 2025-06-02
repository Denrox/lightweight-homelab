#!/bin/bash

LOG_DATE=$(date +%Y-%m-%d)
LOG_FILE="/logs/${LOG_DATE}.log"

cd /logs || exit
ls -t | tail -n +11 | xargs -r rm

exec 1> >(tee -a "${LOG_FILE}")
exec 2>&1

echo "=== Download started at $(date) ==="

if ! ping -c 1 google.com &> /dev/null && ! ping -c 1 cloudflare.com &> /dev/null; then
    echo "No internet connection available. Skipping downloads."
    exit 0
fi

download_if_not_exists() {
    local target_dir="$1"
    local url="$2"
    local filename=$(basename "$url")
    local full_path="$target_dir/$filename"

    if [ ! -f "$full_path" ]; then
        wget -P "$target_dir" "$url"
    fi
}

cd /usr/local/bin/scripts;

download_if_not_exists "../../data/files/os/ubuntu-releases" "https://releases.ubuntu.com/24.04/ubuntu-24.04.2-desktop-amd64.iso"
download_if_not_exists "../../data/files/os/ubuntu-releases" "https://releases.ubuntu.com/24.04/ubuntu-24.04.2-live-server-amd64.iso"
download_if_not_exists "../../data/files/os/debian-releases" "https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.11.0-amd64-netinst.iso"
download_if_not_exists "../../data/files/os/proxmox-releases" "https://enterprise.proxmox.com/iso/proxmox-ve_8.4-1.iso"

./downloader.sh --source "https://download.kiwix.org/zim/stack_exchange/" --dest "../../data/wiki/zim" --pattern "(mathematica\.stackexchange\.com_en_all)" --latest;
sleep 10;
./downloader.sh --source "https://download.kiwix.org/zim/stack_exchange/" --dest "../../data/wiki/zim" --pattern "(askubuntu\.com_en_all)" --latest;
sleep 10;
./downloader.sh --source "https://download.kiwix.org/zim/stack_exchange/" --dest "../../data/wiki/zim" --pattern "(devops\.stackexchange\.com_en_all)" --latest;
sleep 10;
./downloader.sh --source "https://download.kiwix.org/zim/other/" --dest "../../data/wiki/zim" --pattern "(zimgit-medicine_en_)" --latest;
sleep 10;
./downloader.sh --source "https://download.kiwix.org/zim/stack_exchange/" --dest "../../data/wiki/zim" --pattern "(stackoverflow\.com_en_all)" --latest;
sleep 10;
./downloader.sh --source "https://download.docker.com/linux/debian" --dest "../../data/files/download.docker.com" --pattern "(bookworm\/.+\/stable)";
sleep 10;
./downloader.sh --source "https://download.docker.com/linux/ubuntu" --dest "../../data/files/download.docker.com" --pattern "(noble\/.+\/stable)";
sleep 10;
./mirror-rsync.sh;

echo "=== Download completed at $(date) ==="
