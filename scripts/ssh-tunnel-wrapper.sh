#!/bin/bash
#
# Simple wrapper to tunnel the LDAP connections through an
# SSH connection. Requires a valid SSH public key, that will
# be used for the authentication.

exit_requested=0
SSH_PID=""

function help {
  echo "Usage: $0 ssh-host /path/to/id_rsa ldap-uri"
  echo ""
  echo " - ssh-host needs to be a valid ssh connection specification"
  echo "   as in: user@ssh.example.com"
  echo " - /path/to/id_rsa needs to be the path to a valid public"
  echo "   key that will be used for authentication"
  echo " - ldap-uri is an LDAP URI of the form ldap://host[:PORT]"
  echo "   or ldaps://host[:PORT]"
  exit 1
}

function request_exit {
  echo "SIGTERM received, exiting"
  exit_requested=1
  if [ "$SSH_PID" != "" ]; then
    kill $SSH_PID
  fi
}

# Set up trap for SIGTERM and INT
trap request_exit SIGTERM INT

if [ "$1" = "" ]; then
  help
fi

if [ "$2" = "" ]; then
  help
fi

if [ "$3" = "" ]; then
  help
fi

# Find out the host and port to forward locally
ldap_host=$(echo "$3" | sed "s|ldap\(s\)\?:\/\/||")
host=$(echo $ldap_host | cut -d ':' -f1)
echo "$ldap_host" | grep ":[[:digit:]]\+\$" > /dev/null
if [ $? -ne 0 ]; then
  # Take out the port from the URL specification
  port=$(echo $ldap_host | cut -d ':' -f2)
else
  echo $3 | grep "ldaps:" > /dev/null
  if [ $? -eq 0 ]; then
    port="636"
  else
    port="389"
  fi
fi

echo "LDAP configuration:"
echo " - remote host: $host"
echo " - remote port: $port"

while true; do
  echo "Starting SSH tunnel to $1; opening a local forward to port 1636"
  ssh -o "StrictHostKeyChecking=no" -N -L 1636:$host:$port $1 -i $2 &
  SSH_PID="$!"

  echo "SSH launched with PID = $SSH_PID"
  wait $SSH_PID

  if [ $exit_requested -eq 1 ]; then
    echo "Terminating the tunnel"
    exit 0
  fi

  # If we get here the connection failed, likely
  echo "Connection probably failed, re-trying in 30 seconds"
  sleep 30
done
