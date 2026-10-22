# Local Development Workflow for CAPS

This guide explains how to set up a local development environment for CAPS using the CakePHP backend and the Vite frontend development server.

## Prerequisites

Before starting, ensure you have the following installed:
- PHP 7.2 or higher (recommended: 8.1+)
- Composer
- SQLite3 or MySQL database
- Node.js and npm

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd caps
```

### 2. Install PHP Dependencies
Navigate to the backend directory and install all PHP dependencies using Composer:
```bash
  cd backend
  composer install # installa pacchetti PHP
  cp example.env config/.env
  # modifica le variabili d'ambiente in config/.env secondo le tue esigenze
  export $(grep -v '^#' config/.env | xargs)
  bin/cake migrations migrate # crea il database
  vendor/bin/phpunit # esegue test
  bin/cake server # fai partire il server
cd ..
```

## Configurazione di CakePHP

### 3. Set up the Database
#### Option A: Using SQLite (for development)
Create a SQLite database file:
```bash
mkdir -p tmp
touch tmp/caps.sqlite
chmod 777 tmp/caps.sqlite
```

#### Option B: Using MySQL
Create a MySQL database:
```bash
mysql -u root -p
CREATE DATABASE caps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'caps'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON caps.* TO 'caps'@'localhost';
FLUSH PRIVILEGES;
exit
```

### 4. Configure the Application
Copy the example environment file:
```bash
cp example.env .env
```
Edit the `.env` file to set up your database connection:
```bash
# For SQLite
DATABASE_URL="sqlite:///tmp/caps.sqlite"

# For MySQL
DATABASE_URL="mysql://caps:secret@localhost/caps?encoding=utf8mb4&timezone=UTC&cacheMetadata=true&quoteIdentifiers=false&persistent=false"
```

### 5. Run Database Migrations
Create and populate the database tables:
```bash
bin/cake migrations migrate
```

### 6. Create Admin User
Create an initial admin user for accessing the application:
```bash
bin/cake grant-admin admin --force --password admin
```

### 7. Install Frontend Dependencies
Install the frontend npm dependencies:

```bash
cd ../frontend
npm ci
```

### 8. Start the Development Servers
CAPS uses two local servers during development:

- CakePHP runs on `http://localhost:8765`
- Vite runs on `http://localhost:5173` and proxies application requests to CakePHP

Start CakePHP from the backend directory:

```bash
cd ../backend
bin/cake server
```

In another terminal, start Vite from the frontend directory:

```bash
cd frontend
npm run dev
```

Open the application through Vite at `http://localhost:5173`.

Use `http://localhost:8765` only when you explicitly want to bypass Vite. During frontend work, `localhost:5173` should be the entry point so React modules, SCSS, and Vite asset handling are served correctly while classic CakePHP MVC pages continue to work through the proxy.

## Development Commands

### Running Tests
```bash
# Run all tests
vendor/bin/phpunit

# Run a specific test
vendor/bin/phpunit --filter testLoginPage

# Run code sniffer
vendor/bin/phpcs --colors -p --standard=vendor/cakephp/cakephp-codesniffer/CakePHP src/ tests/

# Fix code style issues
vendor/bin/phpcbf --colors --standard=vendor/cakephp/cakephp-codesniffer/CakePHP src/ tests/
```

### Working with CakePHP Console
```bash
# Access CakePHP console
bin/cake

# Create a new controller
bin/cake bake controller Users

# Create a new model
bin/cake bake model Users

# Run migrations
bin/cake migrations migrate

# Show available commands
bin/cake --help
```

## Frontend Development

The frontend is built with Vite. Only some CakePHP pages mount React components, so the Vite dev server proxies all non-frontend asset requests to the CakePHP server on port `8765`.

```bash
cd frontend
npm run dev        # Start the Vite dev server at http://localhost:5173
npm run js         # Build production assets into backend/webroot/js
npm run js:dev     # Build development assets into backend/webroot/js
npm run watch      # Watch and rebuild production assets
npm run watch:dev  # Watch and rebuild development assets
```

Vite writes version files in `backend/webroot/js` so CakePHP can load the current generated JavaScript and CSS assets outside the Vite dev server. In Vite dev-server mode, proxied CakePHP HTML is rewritten to load `/src/caps.js` directly.

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the `backend/` directory with the following structure:

```
APP_NAME="CAPS"
DEBUG=true
APP_ENCODING="UTF-8"
APP_DEFAULT_LOCALE="en_US"
APP_DEFAULT_TIMEZONE="UTC"
SECURITY_SALT="your-salt-here"

# Database configuration
DATABASE_URL="sqlite:///tmp/caps.sqlite"

# Optional OAuth2 login
# OAUTH2_APPID="your-client-id"
# OAUTH2_CLIENT_SECRET="your-client-secret"
# OAUTH2_URL_AUTHORIZE="https://example.org/oauth2/authorize"
# OAUTH2_URL_TOKEN="https://example.org/oauth2/token"
# OAUTH2_URL_USERINFO="https://example.org/oauth2/userinfo"
```

Local development authentication uses local users created in the database, for example with `bin/cake grant-admin`, and optionally OAuth2 if the OAuth2 environment variables are configured. LDAP authentication is not used by the local development workflow.

## Troubleshooting

### Common Issues

1. **Permission errors with cache directories**:
   ```bash
   chmod -R 777 tmp/
   ```

2. **Database connection issues**:
   - Verify database credentials in `.env`
   - Ensure the database exists
   - Check that the database service is running

3. **Composer installation issues**:
   ```bash
   composer install --ignore-platform-reqs
   ```

4. **PHP extensions missing**:
   Ensure required PHP extensions are installed:
   ```bash
   sudo apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-gd
   ```

5. **Frontend changes are not visible**:
   - Make sure you are opening `http://localhost:5173`, not `http://localhost:8765`
   - Restart `npm run dev` after changing `frontend/vite.config.mjs`
   - Make sure the CakePHP server is still running on port `8765`

## Project Structure Overview

```
backend/
├── bin/              # CakePHP console commands
├── config/           # Configuration files
├── src/              # Application source code
├── templates/        # View templates
├── tests/            # Test files
├── tmp/              # Temporary files (cache, logs)
├── webroot/          # Public web root
├── composer.json     # PHP dependencies
├── .env              # Environment configuration
└── README.md         # Project documentation
```

This local development workflow provides a complete setup for working with CAPS using Composer for the CakePHP backend and Vite for the frontend, allowing developers to work efficiently without Docker dependencies.

## Conversione dei vecchi moduli di laurea

Dalla radice del repository, applicare anche la migrazione che aggiunge
`thesis_defenses.source_form_id`, quindi effettuare una simulazione:

```bash
backend/bin/cake migrations migrate
backend/bin/cake import_thesis_defenses 29 2026-01-01 master --dry-run
```

Gli argomenti sono l'ID del tipo di modulo (`form_template_id`), la data minima
**di invio**, inclusa (YYYY-MM-DD), e il tipo di laurea (`master` o `bachelor`).
29 è il tipo del modulo di esempio 1243; la data è solo un esempio.
Sono selezionati i moduli inviati, approvati o respinti, mai le bozze. Il modulo
1243 è una bozza e quindi non viene convertito.

Il comando cerca un appello esistente dello stesso tipo e con `start_date`
uguale al campo `data` del modulo (YYYY-MM-DD, DD/MM/YYYY o DD-MM-YYYY).
Se manca o ce n'è più di uno, segnala un errore: creare l'appello oppure usare
`--session-id ID` per assegnare esplicitamente tutti i moduli selezionati a un
appello del tipo richiesto. Non vengono creati appelli automaticamente.

Per effettuare l'importazione, ripetere il comando senza `--dry-run`.
La simulazione prova anche i salvataggi e le regole di validazione in una
transazione annullata alla fine (può consumare valori AUTO_INCREMENT su MySQL).
Ogni modulo è convertito atomicamente insieme ai suoi relatori e allegati:
un errore annulla quel modulo e il comando prosegue con gli altri, restituendo
un codice di uscita non nullo se si sono verificati errori. Il riepilogo riporta
conversioni, moduli già convertiti ed errori. Il collegamento univoco al modulo
originale impedisce duplicati nelle esecuzioni successive; le domande già
convertite non vengono aggiornate.

Tra i moduli selezionati, per lo stesso studente e appello viene mantenuto solo
l'ultimo invio (`date_submitted` più recente; a parità, ID più alto). Ogni modulo
precedente viene escluso con un avviso che indica gli ID escluso e mantenuto;
il riepilogo conta separatamente i duplicati. Con `--session-id` il confronto
usa l'appello imposto. Se l'ultimo invio non è valido, viene segnalato un errore
senza ripiegare sui precedenti. I moduli originali non vengono modificati.

La conversione usa i campi del vecchio modello italiano:

| Campo modulo | Campo domanda |
| --- | --- |
| `anno_immatricolazione` | `enrollment_year`: anno iniziale per `YYYY/YYYY` o `YYYY/YY`, oppure anno singolo `YYYY` |
| `laurea_triennale` | `bachelor_degree` |
| `conseguimento_lt` | `bachelor_university` |
| `tel_cellulare` | `phone` |
| `titolo` | `title` |
| `controrelatore_1`, `_2`, `_3` | `proposed_second_examiners`, separati da righe |
| `display_pubblico` | `public` (`si`/`sì`: vero; `no`/vuoto: falso) |
| `relatore`, `email_relatore` | Relatore principale |
| `altri_relatori` | Un'unica voce aggiuntiva, testo originale ed email vuota |

Vengono conservati studente, stato, date di invio e valutazione e i dati dei
vecchi campi anche quando l'appello non li richiede più. Anno di immatricolazione,
titolo e relatore principale devono essere validi; dati mancanti o non validi
sono segnalati senza inventare valori. Resta attiva la regola che impedisce più
domande in attesa per lo stesso studente, anche durante una simulazione.

Gli allegati vengono copiati con nome, MIME type, contenuto e data. Le righe
senza nome file, MIME type e contenuto binario vengono ignorate: i commenti
senza file rimangono consultabili soltanto nel modulo originale. Un file con
contenuto ma metadati mancanti continua a essere segnalato come errore. I moduli e
gli allegati originali restano intatti: commenti agli allegati, autorizzazioni
e altri campi senza una destinazione equivalente restano consultabili lì.
Il comando non invia email.
