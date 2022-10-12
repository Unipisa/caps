set -e 

# you need credentials to login as the following user:
REMOTE_USERNAME="root"
REMOTE_HOSTNAME="caps.dm.unipi.it"
echo connecting to ${REMOTE_USERNAME}@${REMOTE_HOSTNAME}

# obtaining IP address of docker container running caps
REMOTE_IP=$( ssh ${REMOTE_USERNAME}@${REMOTE_HOSTNAME} docker inspect capsmatematica_caps-db_1 | grep IPAddress | tail -1 | cut -f4 -d\" )
echo "REMOTE_IP: ${REMOTE_IP}"

# obtaining mysql password
export MYSQL_PASSWORD=$( ssh root@caps.dm.unipi.it "grep CAPS_DB_PASSWORD docker/caps-matematica/caps.env" | cut -f2 -d= )
echo "MYSQL_PASSWORD:" $(echo ${MYSQL_PASSWORD} | wc -c) "chars" 

# open port forwarding and run js import script migrate-mysql.js
ssh -L 3306:${REMOTE_IP}:3306 root@caps.dm.unipi.it cat & node migrate-mysql.js