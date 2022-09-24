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
use Cake\Routing\RouteBuilder;
use Cake\Routing\Route\DashedRoute;
use Cake\Utility\Inflector;

return function (RouteBuilder $routes) {

    $routes->scope('/', function (RouteBuilder $routes): void {
        $routes->setExtensions([ 'json', 'csv', 'xlsx', 'ods' ]);

         // Connect '/' to users/login, that will either show the
         // login form or redirect the user to the right location.
        $routes->connect('/', [ 'controller' => 'Users', 'action' => 'login' ]);

        $routes->prefix('api/v1', function (RouteBuilder $routes) {
            $api_controllers = [ 
                'Curricula', 'Degrees', 'Documents', 
                'Exams', 'FormAttachments', 'Forms', 'FormTemplates', 
                'Groups', 'Proposals', 'Users', 
                'Dashboard', 'Logs', 'FormAuths'
            ];

            foreach ($api_controllers as $controller) {
                $uri = Inflector::underscore($controller);

                $routes->connect('/' . $uri, 
                    ['controller' => $controller, 'action' => 'index']
                )->setMethods([ 'GET' ]);

                foreach ([ 'GET', 'POST', 'DELETE', 'PATCH', 'PUT'] as $method) {
                    $routes->connect('/' . $uri . '/*', 
                        [ 'controller' => $controller, 'action' => strtolower($method) ]
                    )->setMethods([ $method ]);
                }
            }

            // Status
            $routes->connect('/status', [ 'controller' => 'Rest', 'action' => 'status' ])->setMethods([ 'GET' ]);
        });

        // Handle the usual mapping /:controller/:action/params
        $routes->fallbacks(DashedRoute::class);
    });
};
