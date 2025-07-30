#!/bin/bash
echo "Installing Debian package build dependencies"
apt-get update
apt-get install -y dpkg-dev
