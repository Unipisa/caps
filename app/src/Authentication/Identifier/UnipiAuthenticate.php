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

namespace App\Authentication\Identifier;

use App\Model\Entity\User;
use Authentication\Identifier\AbstractIdentifier;
use Cake\Auth\BaseAuthenticate;
use Cake\Core\InstanceConfigTrait;
use Cake\Http\Response;
use Cake\Http\ServerRequest;
use Cake\Log\Log;
use Cake\ORM\TableRegistry;

function array_get($array, $key, $default = null)
{
    if (isset($array[$key])) {
        return $array[$key];
    }

    return $default;
}

class UnipiAuthenticate extends AbstractIdentifier {
    use InstanceConfigTrait;

    protected $_defaultConfig  = [
        'fields' => [
            'username' => 'username',
            'password' => 'password'
        ],
        'userModel' => 'Users',
        'contain' => null,
        'passwordHasher' => 'Default'
    ];

    public function __construct($registry, $config = null)
    {
        parent::__construct($registry, $config);
        $ini_filename = APP . DS . ".." . DS . "unipi.ini";
        if (file_exists($ini_filename)) {
            $this->setConfig(parse_ini_file($ini_filename));
        }
    }

    public function identify(array $data)
    {
        $user = $this->ldapIdentify($data);

        if ($user) {
            $users_table = TableRegistry::getTableLocator()->get('Users');

            $identity = $users_table
                ->find()
                ->where(['username' => $user['username']])
                ->first();

            if (! $identity) {
                $identity = new User();
            }

            $identity = $users_table->patchEntity($identity, [
                'name' => ucwords(strtolower($user['name'])),
                'username' => $user['username'],
                'number' => $user['number'],
                'surname' => $user['surname'],
                'givenname' => $user['givenname'],
                'email' => $user['email'],
                // We only use the database admin flag if the user is
                // not found; otherwise a user might have been granted 
                // admin privileges locally and we respect that.
                'admin' => $identity['admin'] || $user['admin'] 
            ]);

            if ($users_table->save($identity)) {
                Log::write('debug', 'Added user ' . $identity['username'] . ' to the database');
            }
            else {
                Log::write('error',
                    'Error adding user ' . $identity['username'] . ' to the database');
            }
        }
        else {
            $identity = false;
        }

        return $identity;
    }

    public function ldapIdentify(array $data)
    {
        $config = $this->getConfig();

        // If the user requested it, we do not validate the SSL certificate
        // given from the LDAP server (if any). Since this used to be the default
        // before the 'verify_cert' config option existed, we behave in a backward
        // compatible way when the key is not found.
        if (! (array_key_exists('verify_cert', $config) && $config['verify_cert']))
            putenv("LDAPTLS_REQCERT=never");

        // We need to connect to the LDAP Unipi server to authenticate the user.
        $r = null;
        $ds = ldap_connect($config['ldap_server_uri']);

        if ($ds) {
            ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

            $base_dn = array_get($config, 'base_dn', array_get($config, 'admin_base_dn'));
            $bind_dn = "uid=" . $data['username'] . "," . $base_dn;
            $r = @ldap_bind($ds, $bind_dn, $data['password']);
            if ($r) {
                // Search for the user in the tree
                $results = ldap_search($ds, $base_dn, "uid=" . $data['username']);

                if (ldap_count_entries($ds, $results) > 0) {
                    $matches = ldap_get_entries($ds, $results);
                    $m = $matches[0];

                    // If we got till here then the user can be logged in. Just make sure that we build up
                    // an array of its properties so we can use them later
                    return [
                        'ldap_dn' => $m['dn'],
                        'username' => $data['username'],
                        'givenname' => $m['givenname'][0],
                        'surname' => $m['sn'][0],
                        'name' => $m['cn'][0],
                        'number' => $user['matricola'] = array_get($m, 'unipistudentematricola', [$data['username']])[0],
                        'admin' => False,
                        'email' => $m['mail'][0]
                    ];
                }
            }
        }

        // no authentication passed

        error_log("Invalid credentials. If you need an admin login check the command 'bin/cake grant_admin'");
        return false;
    }
}

?>