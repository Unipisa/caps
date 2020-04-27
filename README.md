# CAPS
[![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/master?label=master)](https://travis-ci.org/github/Unipisa/caps/) [![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/develop?label=develop)](https://travis-ci.org/github/Unipisa/caps/)

Questo repository contiene CAPS, il portale utilizzato per sottomettere ed approvare i piani di studio presso il Dipartimento di Matematica, Università di Pisa.




## Installazione
```
apt install composer
apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-ldap
apt install sqlite3  # for development
```

## Configurazione
```
cd app
ln -s app.default.php config/app.php # Configurazione locale
ln -s unipi.default.ini unipi.ini # In alternativa, aggiungere degli utenti di prova a scelta,
                                  # oppure configurare LDAP in modo opportuno.
composer install
```

## Sviluppo
Utilizziamo il *branching model* descritto qui: https://nvie.com/posts/a-successful-git-branching-model/ in particolare il branch *master* deve poter andare immediatamente in produzione mentre le modifiche non completamente testate andranno nel branch *develop*

```
cd app
git checkout develop
bin/cake migrations migrate # Crea o aggiorna il database
vendor/bin/phpunit # run unit tests
vendor/bin/phpunit --filter testLoginPage # run a single test
tail -f logs/*.log # display error messages 
bin/cake server & # run a development server
```

Per importare un dump vecchio del database è necessario prima migrare ad una versione
compatibile, e poi effettuare il resto delle migrazioni. Ad esempio:
```
bin/cake migrations migrate -t 20191217155946
sqlite3 caps.sqlite < dump.sql
bin/cake migrations migrate
```

Per aggiungere nuove migrazioni (un esempio):
```
bin/cake bake migration CreateProposals approved:boolean submitted:boolean frozen:boolean user_id:integer modified:datetime
```

## Inoltro dell'LDAP in locale

Per utilizzare un server LDAP disponibile in remoto (ad esempio '''idm2.unipi.it''' sulla macchina '''pagine.dm.unipi.it''')
in locale, va inoltrata la porta tramite SSH:
```
ssh -L 1636:idm2.unipi.it:636 utente@pagine.dm.unipi.it
```
e poi va modificato il file '''unipi.ini''' per puntare all'LDAP locale, ad esempio:
```
; URI del server LDAP da interrogare
ldap_server_uri = ldaps://127.0.0.1:1636/

; Base DN dove cercare gli studenti
students_base_dn = "dc=studenti,ou=people,dc=unipi,dc=it"

; Base DN dove cercare i docenti
admins_base_dn = "dc=dm,ou=people,dc=unipi,dc=it"
```
