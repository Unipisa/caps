# CAPS
[![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/master?label=master)](https://travis-ci.org/github/Unipisa/caps/) [![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/develop?label=develop)](https://travis-ci.org/github/Unipisa/caps/)

Questo repository contiene CAPS, il portale utilizzato per sottomettere ed approvare i piani di studio presso il Dipartimento di Matematica, Università di Pisa.

## Installazione
```bash
apt install composer
apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-ldap php-gd
apt install sqlite3  # for development
```

## Configurazione
```bash
cd app
cp config/app.default.php config/app.php # Configurazione locale, richiede di impostare i parametri per LDAP
composer install
```
Per utilizzare un server LDAP con certificato SSL non valido, ad esempio perchè inoltrato
tramite una porta locale, è necessario modificare il parametro ```verify_cert``` a false in 
```app.php``` (si trovano più dettagli sotto). Ovviamente, questa configurazione non è ideale in produzione. 

## Sviluppo
Utilizziamo il *branching model* descritto qui: https://nvie.com/posts/a-successful-git-branching-model/ in particolare il branch *master* deve poter andare immediatamente in produzione mentre le modifiche non completamente testate andranno nel branch *develop*

```bash
cd app
git checkout develop
bin/cake migrations migrate # Crea o aggiorna il database
vendor/bin/phpunit # run unit tests
vendor/bin/phpunit --filter testLoginPage # run a single test
tail -f logs/*.log # display error messages 
bin/cake server & # run a development server
```

Una volta fatto il login con un utente, è possibile renderlo amministratore con il comando
```bash
bin/cake grant-admin username
```
Una volta che è presente il primo amministratore, gli altri possono essere creati
tramite interfaccia web. 


Per importare un dump vecchio del database è necessario prima migrare ad una versione
compatibile, e poi effettuare il resto delle migrazioni. Ad esempio:
```bash
bin/cake migrations migrate -t 20191217155946
sqlite3 caps.sqlite < dump.sql
bin/cake migrations migrate
```

Per aggiungere nuove migrazioni (un esempio):
```bash
bin/cake bake migration CreateProposals approved:boolean submitted:boolean frozen:boolean user_id:integer modified:datetime
```

## Inoltro dell'LDAP in locale

Per utilizzare un server LDAP disponibile in remoto (ad esempio '''idm2.unipi.it''' sulla macchina '''caps.dm.unipi.it''')
in locale, va inoltrata la porta tramite SSH:
```bash
ssh -L 1636:idm2.unipi.it:636 utente@caps.dm.unipi.it
```
e poi va modificato il file '''config/app.php''' per puntare all'LDAP locale, ad esempio:
```php
'UnipiAuthenticate' => [
  'ldap_server_uri' => 'ldaps://127.0.0.1:1636/',
  'base_dn' => "ou=people,dc=unipi,dc=it",
  'verify_cert' => false
]
```
I parametri opzionali ```admin``` e ```fakes``` possono essere utilizzati per forzare
alcuni utenti ad essere amministratori, o per creare utenti fittizzi. 


