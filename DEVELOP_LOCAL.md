# Local Development Workflow for CAPS Backend (CakePHP)

This guide explains how to set up a local development environment for the CAPS backend using Composer.

## Prerequisites

Before starting, ensure you have the following installed:
- PHP 7.2 or higher (recommended: 8.1+)
- Composer
- SQLite3 or MySQL database
- Node.js and npm (for frontend assets)

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

### 7. Start the Development Server
You can start the built-in PHP development server:
```bash
bin/cake server
```

The application will be available at `http://localhost:8765`

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

The frontend assets are managed with npm. To work on frontend components:

```bash
cd frontend
npm ci
npm run watch  # Watch for changes and rebuild automatically
npm run deploy # Build for production
npm run deploy:dev # Build for development
```

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

# LDAP configuration (optional)
# CAPS_LDAP_URI="ldaps://ldap.example.com:636/"
# CAPS_LDAP_BASE="ou=people,dc=example,dc=com"
# CAPS_VERIFY_CERT=false
```

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
   sudo apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-ldap php-gd
   ```

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

This local development workflow provides a complete setup for working with the CakePHP backend using Composer, allowing developers to work efficiently without Docker dependencies.