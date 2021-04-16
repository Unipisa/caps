#!/bin/bash
#

function shutdown {
    kill ${watch_pid}
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

# Check if composer is installed
type composer 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  echo "Composer not found, please install it, go to https://getcomposer.org/"
  echo "or run sudo apt-get install composer (on Ubuntu)"
  exit 2
fi

# Check if composer is installed
type npm 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  echo "NPM not found, please install it, go to https://www.npmjs.com/"
  echo "or run sudo apt-get install npm (on Ubuntu)"
  exit 2
fi

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
set -ex

cd app
composer -n install
cd ..

cd html
npm install
cd ..

# Start the development server. If needed, build the image
${DOCKERCOMPOSE} -f docker/docker-compose-dev.yml build
${DOCKERCOMPOSE} -f docker/docker-compose-dev.yml up &

(cd html && npm run watch )&
watch_pid=$!

wait
