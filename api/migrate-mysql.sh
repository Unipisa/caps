#!/bin/bash
set -e 

# you need credentials to login as the following user:
export REMOTE_USERNAME="root"
export REMOTE_HOSTNAME="caps.dm.unipi.it"
echo connecting to ${REMOTE_USERNAME}@${REMOTE_HOSTNAME}

# obtaining IP address of docker container running caps
export REMOTE_IP=$( ssh ${REMOTE_USERNAME}@${REMOTE_HOSTNAME} docker inspect capsmatematica_caps-db_1 | grep IPAddress | tail -1 | cut -f4 -d\" )
echo "REMOTE_IP: ${REMOTE_IP}"

# obtaining mysql password
export MYSQL_PASSWORD=$( ssh ${REMOTE_USERNAME}@${REMOTE_HOSTNAME} "grep CAPS_DB_PASSWORD docker/caps-matematica/caps.env" | cut -f2 -d= )
echo "MYSQL_PASSWORD:" $(echo ${MYSQL_PASSWORD} | wc -c) "chars" 

# open port forwarding and run js import script migrate-mysql.js
echo "opening ssh tunnel"
ssh -N -L 3306:${REMOTE_IP}:3306 root@caps.dm.unipi.it &
pidof_ssh=$!

function cleanup {
  echo "closing ssh tunnel  "
  kill ${pidof_ssh}
}

trap cleanup EXIT

sleep 1
echo "start js script"
node migrate-mysql.js

#kill ${pidof_ssh}
