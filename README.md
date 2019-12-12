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
cp config/app.default.php config/app.php # Configurazione locale
bin/cake migrations migrate # Crea o aggiorna il database
bin/cake server # run a development server
```
