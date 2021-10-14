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
  echo "Using the default configuration for CAPS, spawning a test LDAP server."
  echo "You may want to configure docker/caps.env based on your setup."
  cp docker/caps.env.template docker/caps.env
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
if [ ! -x app/composer.phar ]; then
  echo "Composer not found, downloading it"
  cd app/

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

cd app
php ./composer.phar -n install
cd ..

cd html
npm install
cd ..

VARIANT="$1"
if [ "$VARIANT" = "" ]; then
  VARIANT="dev"
fi

# Start the development server. If needed, build the image
echo ""
echo "== IMAGE REGENERATION =="
echo "Regenerating the image is only needed in case there have been"
echo "changes in the migrations or the app configuration, or if this"
echo "is the first time that the script is used. "
echo "The regeneration can take some time."
echo ""
echo -n "Do you wish to regenerate the images now? [yn]: "
read ANS
sudo true
if [ "$ANS" = "y" ]; then
  ${DOCKERCOMPOSE} -f docker/docker-compose-dev.yml build caps
fi
${DOCKERCOMPOSE} -f docker/docker-compose-$VARIANT.yml up &

echo "Node Configuration"
echo "  > Using NodeJS $(node --version)"
echo "  > Using NPM $(npm --version)"
echo ""

(cd html && npm run watch:dev )&
watch_pid=$!

(cd html && npm run watch )&
watch_pid2=$!

wait
