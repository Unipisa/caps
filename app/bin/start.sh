#!/bin/bash

grep pagine.dm.unipi.it ~/.ssh/config > /dev/null
if [ $? -ne 0 ]; then
  echo "Configurazione per pagine.dm.unipi.it non trovata in ~/.ssh/config"
  echo " > Perché questo script funzioni, è necessario che si possa effettuare"
  echo " > ssh pagine.dm.unipi.it senza autenticazione"
  echo ""
  echo "Provo a procedere ugualmente"
fi

ssh -L 1636:idm2.unipi.it:636 pagine.dm.unipi.it -N &
ssh_pid=$!

trap shutdown INT

function shutdown {
    echo -n "Closing all the servers, goodbye ... "
    kill ${ssh_pid}
    kill ${cake_pid}
    echo "done"
}

$(dirname $0)/cake server -H 0.0.0.0 &
cake_pid=$!

sleep 1

echo ""
echo "Server started:"
echo -e "  >> \033[32;1mSSH\033[0m PID: ${ssh_pid}"
echo -e "  >> \033[32;1mCAKE\033[0m PID: ${cake_pid}"

wait


