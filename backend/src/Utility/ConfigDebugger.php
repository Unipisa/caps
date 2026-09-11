<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */

namespace App\Utility;

use Cake\Core\Configure;
use Cake\Log\Log;

/**
 * Utility class for debugging configuration with sensitive data anonymization
 */
class ConfigDebugger
{
    /**
     * Debug all configuration on startup with sensitive data anonymization
     *
     * @return void
     */
    public static function debugConfig(): void
    {
        // Only debug when in debug mode
        if (!Configure::read('debug')) {
            return;
        }

        $config = Configure::read();
        $anonymizedConfig = self::anonymizeConfig($config);
        
        // Log the anonymized configuration
        $message = "=== CAPS Configuration Debug ===\n";
        $message .= self::formatConfig($anonymizedConfig, 0);
        $message .= "\n===============================";
        
        // Log to debug log
        Log::debug($message);
        
        // Also output to stdout in CLI mode for immediate visibility
        if (PHP_SAPI === 'cli') {
            echo $message . "\n";
        }
    }

    /**
     * Anonymize sensitive configuration data
     *
     * @param array $config Configuration array to anonymize
     * @return array Anonymized configuration
     */
    private static function anonymizeConfig(array $config): array
    {
        $sensitiveKeys = [
            'password',
            'secret',
            'token',
            'key',
            'pass',
            'pwd',
            'db_password',
            'database_password',
            'smtp_password',
            'ldap_password',
            'CAPS_DB_PASSWORD',
            'CAPS_ADMIN_TOKEN',
            'SECURITY_SALT',
            'SMTP_PASSWORD',
            'CAPS_LDAP_PASSWORD'
        ];

        $anonymized = [];
        
        foreach ($config as $key => $value) {
            $lowerKey = strtolower($key);
            
            // Check if this key contains sensitive data
            $isSensitive = false;
            foreach ($sensitiveKeys as $sensitiveKey) {
                if (strpos($lowerKey, $sensitiveKey) !== false) {
                    $isSensitive = true;
                    break;
                }
            }
            
            if ($isSensitive && is_string($value) && !empty($value)) {
                // Anonymize sensitive data
                $anonymized[$key] = self::anonymizeString($value);
            } elseif (is_array($value)) {
                // Recursively anonymize nested arrays
                $anonymized[$key] = self::anonymizeConfig($value);
            } else {
                $anonymized[$key] = $value;
            }
        }
        
        return $anonymized;
    }

    /**
     * Anonymize a string by showing only first and last characters
     *
     * @param string $value String to anonymize
     * @return string Anonymized string
     */
    private static function anonymizeString(string $value): string
    {
        if (strlen($value) <= 2) {
            return '**';
        }
        
        // For longer strings, show first and last character
        $first = substr($value, 0, 1);
        $last = substr($value, -1);
        $middleLength = strlen($value) - 2;
        $middle = str_repeat('*', $middleLength);
        
        return $first . $middle . $last;
    }

    /**
     * Format configuration array for logging
     *
     * @param array $config Configuration to format
     * @param int $depth Current depth for indentation
     * @return string Formatted configuration
     */
    private static function formatConfig(array $config, int $depth = 0): string
    {
        $indent = str_repeat('  ', $depth);
        $output = '';
        
        foreach ($config as $key => $value) {
            if (is_array($value)) {
                $output .= $indent . "$key:\n";
                $output .= self::formatConfig($value, $depth + 1);
            } else {
                $output .= $indent . "$key: $value\n";
            }
        }
        
        return $output;
    }
}