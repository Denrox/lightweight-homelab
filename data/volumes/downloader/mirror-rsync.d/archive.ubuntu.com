#This file is dot-sourced so use bash syntax!
name='ubuntu'
releases=('noble' 'noble-updates' 'noble-backports' 'noble-security')
repositories=('main' 'restricted' 'universe' 'multiverse')
architectures=('i386' 'amd64')