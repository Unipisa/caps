#!/bin/bash
#

NODE_VERSION=$(grep "NODE_VERSION=" Dockerfile | cut -d '=' -f2)

function shutdown {
    kill ${watch_pid}
    kill ${watch_pid2}
}

function die {
    echo $*
    exit 3
}

trap shutdown INT

if [ ! -r docker/caps.env ]; then
  echo "Using the default configuration for CAPS."
  echo "You may want to configure docker/caps.env based on your setup."
  cp example.env docker/caps.env
fi

# Check if docker is installed
type docker 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  echo "Docker not found, please install it, go to https://docs.docker.com/get-docker/"
  exit 1
fi

type php 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  echo "PHP not found, please install it."
  exit 1
fi

# Check if composer is installed
if [ ! -x backend/composer.phar ]; then
  echo "Composer not found, downloading it"
  cd backend/

  # Adapted from: https://getcomposer.org/doc/faqs/how-to-install-composer-programmatically.md
  EXPECTED_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')"
  php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
  ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

  if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]
  then
    >&2 echo 'Composer Installer: Invalid installer checksum'
    rm composer-setup.php
    exit 1
  fi

  php composer-setup.php --quiet
  rm composer-setup.php

  cd ..
fi

# Check if NPM is installed
type npm 2> /dev/null > /dev/null
if [ ! -d node-v${NODE_VERSION}-linux-x64 ]; then 
  echo "NPM not found, downloading it"
  wget -q https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz || die "Could not download NodeJS"
  tar xJf node-v${NODE_VERSION}-linux-x64.tar.xz || die "Could not unpack NodeJS"
  rm node-v${NODE_VERSION}-linux-x64.tar.xz
fi

# Make sure the downloaded NPM / Node is used first
export PATH="$(pwd)/node-v${NODE_VERSION}-linux-x64/bin:$PATH"

# Check if we can run docker without root privileges
if [ -z	$DOCKER ]; then
  DOCKER="sudo docker"
fi
echo "Configuration: DOCKER = ${DOCKER}"

if [ -z $DOCKERCOMPOSE ]; then
  DOCKERCOMPOSE="sudo docker-compose"
fi
echo "Configuration: DOCKERCOMPOSE = ${DOCKERCOMPOSE}"

# From now on, all command should succeed
set -e

#cd backend
#php ./composer.phar -n install
#cd ..

#cd frontend
#npm ci
#cd ..

VARIANT="$1"
if [ "$VARIANT" = "" ]; then
  VARIANT="dev"
fi

sudo docker build -t getcaps/caps:develop .
${DOCKERCOMPOSE} -f docker/docker-compose-$VARIANT.yml up &

echo "Node Configuration"
echo "  > Using NodeJS $(node --version)"
echo "  > Using NPM $(npm --version)"
echo ""

(cd frontend && npm run watch:dev )&
watch_pid=$!

(cd frontend && npm run watch )&
watch_pid2=$!

wait
