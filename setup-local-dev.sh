#!/bin/bash

# Local Development Setup Script for CAPS Backend
# This script automates the setup of a local development environment

set -e  # Exit on any error

echo "Setting up local development environment for CAPS backend..."

# Check if we're in the right directory
if [ ! -f "backend/composer.json" ]; then
    echo "Error: This script must be run from the project root directory"
    exit 1
fi

# Change to backend directory
cd backend

# Check if composer is installed
if ! command -v composer &> /dev/null; then
    echo "Error: Composer is not installed"
    exit 1
fi

# Check for PHP extensions required by Composer packages
missing_php_extensions=()
for extension in dom SimpleXML; do
    if ! php -m | grep -qi "^${extension}$"; then
        missing_php_extensions+=("$extension")
    fi
done

if [ ${#missing_php_extensions[@]} -gt 0 ]; then
    php_version="$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;' 2>/dev/null || true)"
    php_xml_package="php-xml"
    if [ -n "$php_version" ]; then
        php_xml_package="php${php_version}-xml"
    fi

    echo "Error: Missing PHP extension(s): ${missing_php_extensions[*]}"
    echo "Composer dependencies require the PHP XML extensions DOM and SimpleXML."
    echo ""
    echo "On Debian/Ubuntu, install them with:"
    echo "  sudo apt install ${php_xml_package}"
    echo ""
    echo "Then verify with:"
    echo "  php -m | grep -E '^(dom|SimpleXML)$'"
    exit 1
fi

# Install PHP dependencies
echo "Installing PHP dependencies..."
composer install

# Create SQLite database directory if it doesn't exist
echo "Setting up database..."
mkdir -p tmp
touch tmp/caps.sqlite
chmod 777 tmp/caps.sqlite

# Copy example environment file
echo "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp example.env .env
    echo "Created .env file from example.env"
else
    echo ".env file already exists"
fi

# Run database migrations
echo "Running database migrations..."
bin/cake migrations migrate

# Create admin user
echo "Creating admin user..."
bin/cake grant-admin admin --force --password admin

echo "Local development environment setup complete!"
echo ""
echo "To start the development server, run:"
echo "  $(pwd)/bin/cake server"
echo ""
echo "The application will be available at http://localhost:8765"
