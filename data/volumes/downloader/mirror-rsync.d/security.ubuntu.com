#This file is dot-sourced so use bash syntax!
name='ubuntu'
releases=('noble-security')
repositories=('main' 'restricted' 'universe' 'multiverse')
architectures=('i386' 'amd64')