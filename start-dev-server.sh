#!/bin/sh
#

if [ ! -r docker/caps.env ]; then
  echo "Please configure the development environment by copying "
  echo "docker/caps.env.template into docker/caps.env, and setting"
  echo "the correct values"
fi

# Check if docker is installed
type docker 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  echo "Docker not found, please install it, go to https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if we can run docker without root privileges
DOCKER=docker
${DOCKER} ps 2> /dev/null > /dev/null
if [ $? -ne 0 ]; then
  DOCKER="sudo docker"
fi

# Start the development server
sudo docker-compose -f docker/docker-compose-dev.yml up
