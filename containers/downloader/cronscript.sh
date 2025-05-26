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

cd /usr/local/bin/scripts;

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
