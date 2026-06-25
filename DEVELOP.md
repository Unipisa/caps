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
composer install
```

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
