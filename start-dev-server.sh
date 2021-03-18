#!/bin/bash
#

function shutdown {
    kill ${watch_pid}
    # kill ${docker_pid}
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

# Check if we can run docker without root privileges
DOCKER=docker
DOCKERCOMPOSE="sudo docker-compose"
${DOCKER} ps 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  DOCKER="sudo docker"
fi

(cd html && npm run watch )&
watch_pid=$!

# Start the development server. If needed, build the image
${DOCKERCOMPOSE} -f docker/docker-compose-dev.yml up --build &
docker_pid=$!

wait
