#!/bin/bash

cd /usr/local/bin/scripts && ./cronscript.sh

cron

tail -f /var/log/cron.log