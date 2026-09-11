#!/usr/bin/php -q
<?php
// Check platform requirements
require dirname(__DIR__) . '/config/requirements.php';
require dirname(__DIR__) . '/vendor/autoload.php';

// Load environment variables from .env file
if (file_exists(dirname(__DIR__) . '/.env')) {
    // Try to load environment variables using dotenv
    try {
        // The josegonzalez/dotenv package provides the Dotenv\Dotenv class
        $dotenv = new josegonzalez\Dotenv\Loader(dirname(__DIR__) . '/.env');
        $dotenv->parse();
        $dotenv->skipExisting(['toEnv', 'putenv']);
        $dotenv->toEnv();
        // Cake's server command starts `php -S` as a child process. Export the
        // values so that child process inherits them as well.
        $dotenv->putenv();
    } catch (Exception $e) {
        // Silently ignore if dotenv fails
        error_log('Failed to load .env file: ' . $e->getMessage());
    }
}

use App\Application;
use Cake\Console\CommandRunner;

// Build the runner with an application and root executable name.
$runner = new CommandRunner(new Application(dirname(__DIR__) . '/config'), 'cake');
exit($runner->run($argv));
