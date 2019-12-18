# CAPS
Questo repository contiene CAPS, il portale utilizzato per sottomettere ed approvare i piani di studio presso il Dipartimento di Matematica, Università di Pisa.


## Installazione
```
apt install composer
apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql
apt install sqlite3  # for development
cd app
composer install
```

## Sviluppo
```
cd app
ln -s config/app.default.php config/app.php # Configurazione locale
ln -s unipi.ini unipi.default.ini # In alternative, aggiungere degli utenti di prova a scelta, 
                                  # oppure configurare LDAP in modo opportuno. 
bin/cake migrations migrate # Crea o aggiorna il database
vendor/bin/phpunit # run unit tests
bin/cake server # run a development server

```

Per aggiungere nuove migrazioni (un esempio):
```
bin/cake bake migration CreateProposals approved:boolean submitted:boolean frozen:boolean user_id:integer modified:datetime
```
