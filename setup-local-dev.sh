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
echo "  bin/cake server"
echo ""
echo "The application will be available at http://localhost:8765"