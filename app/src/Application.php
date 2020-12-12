<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
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
namespace App;

use Cake\Cache\Cache;
use Cake\Core\Configure;
use Cake\Core\Exception\MissingPluginException;
use Cake\Error\Middleware\ErrorHandlerMiddleware;
use Cake\Http\BaseApplication;
use Cake\Routing\Middleware\AssetMiddleware;
use Cake\Routing\Middleware\RoutingMiddleware;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Application setup class.
 *
 * This defines the bootstrapping logic and middleware layers you
 * want to use in your application.
 */
class Application extends BaseApplication
{
    public static $_CAPSVERSION = '2.1.0';

    /**
     * application version number
     */
    public static function getVersion()
    {
        // Try to get the answer from Cache, if possible; we ensure that
        // we clean the cache on restart, so we always get fresh information
        // on the application version
        $version = Cache::read('caps-version');

        if ($version == false) {
            // We try to run git, but we are aware that:
            // - git may not be installed.
            // - this build might not be inside a git repository
            // Hence, in case of failure we fall back to the static version numbers
            // that we have set here.
            $branch = trim(exec('git rev-parse --abbrev-ref HEAD'));

            if ($branch == "")
            {
                $version = Application::$_CAPSVERSION;
                $shortVersion = Application::$_CAPSVERSION;
            }
            else
            {
                $version = trim(exec('git describe --tags'));
                $commitDate = new \DateTime(trim(exec('git log -n1 --pretty=%ci HEAD')));
                $commitDate->setTimezone(new \DateTimeZone('Europe/Rome'));
                $commitDate = $commitDate->format('Y-m-d H:i:s');
                $shortVersion = explode('-', $version)[0];

                if ($branch === "master") {
                    $version = sprintf('%s [%s]', $version, $commitDate);
                } else {
                    $version = sprintf('%s-%s [%s]', $version, $branch, $commitDate);
                }
            }

            Cache::write('caps-version', $version);
            Cache::write('caps-short-version', $shortVersion);
        }

        return $version;
    }

    public static function getShortVersion()
    {
        self::getVersion();

        return Cache::read('caps-short-version');
    }

    /**
     * {@inheritDoc}
     */
    public function bootstrap()
    {
        $this->addPlugin('CsvView');

        $this->addPlugin('Migrations');

        // Call parent to load bootstrap from files.
        parent::bootstrap();

        if (PHP_SAPI === 'cli') {
            $this->bootstrapCli();
        }

        /*
         * Only try to load DebugKit in development mode
         * Debug Kit should not be installed on a production system
         */
        if (Configure::read('debug')) {
            $this->addPlugin(\DebugKit\Plugin::class);
        }

        // Load more plugins here
    }

    /**
     * Setup the middleware queue your application will use.
     *
     * @param \Cake\Http\MiddlewareQueue $middlewareQueue The middleware queue to setup.
     * @return \Cake\Http\MiddlewareQueue The updated middleware queue.
     */
    public function middleware($middlewareQueue)
    {
        $middlewareQueue
            // Catch any exceptions in the lower layers,
            // and make an error page/response
            ->add(new ErrorHandlerMiddleware(null, Configure::read('Error')))

            // Handle plugin/theme assets like CakePHP normally does.
            ->add(new AssetMiddleware([
                'cacheTime' => Configure::read('Asset.cacheTime')
            ]))

            // Add routing middleware.
            // If you have a large number of routes connected, turning on routes
            // caching in production could improve performance. For that when
            // creating the middleware instance specify the cache config name by
            // using it's second constructor argument:
            // `new RoutingMiddleware($this, '_cake_routes_')`
            ->add(new RoutingMiddleware($this));

        return $middlewareQueue;
    }

    /**
     * @return void
     */
    protected function bootstrapCli()
    {
        try {
            $this->addPlugin('Bake');
        } catch (MissingPluginException $e) {
            // Do not halt if the plugin is missing
        }

        $this->addPlugin('Migrations');

        // Load more plugins here
    }
}
