<?php


// namespace App\Controller\Component\Auth;
namespace App\Auth;

use Cake\Auth\BaseAuthenticate;
use Cake\Http\Response;
use Cake\Http\ServerRequest;
use Cake\Log\Log;

function array_get($array, $key, $default = null)
{
    if (isset($array[$key])) {
        return $array[$key];
    }

    return $default;
}

class UnipiAuthenticate extends BaseAuthenticate
{
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

    public function authenticate(ServerRequest $request, Response $response)
    {
        $config = $this->getConfig();
        //        Log::write('debug', "******". print_r($config, true));
        $data = $request->getData();

        $admin_usernames = [];
        if (array_key_exists('admins', $config)) {
            $admin_usernames = $config['admins'];
        }

        // Allow admins to browse as a student.
        $user = [
            'ldap_dn' => '',
            'username' => $data['username'],
            'name' => 'Utente Dimostrativo',
            'number' => '000000',
            'admin' => in_array($data['username'], $admin_usernames),
            'surname' => '',
            'givenname' => '',
            'email' => 'unknown@nodomain.no'
        ];

        foreach ($config['fakes'] as $fake) {
            if (is_array($fake)) {
                // configuration contains user info
                if ($data['username'] == $fake['user'] && $data['password'] == $fake['password']) {
                    foreach ($user as $key => $val) {
                        if (array_key_exists($key, $fake)) {
                            $user[$key] = $fake[$key];
                        }
                    }

                    return $user;
                }
            } else {
                // configuration only contains username
                if ($data['username'] == $fake && $data['password'] == $fake) {
                    $user['username'] = $fake;

                    return $user;
                }
            }
        }

        // If the user requested it, we do not validate the SSL certificate
        // given from the LDAP server (if any). Since this used to be the default
        // before the 'verify_cert' config option existed, we behave in a backward
        // compatible way when the key is not found.
        if (! (array_key_exists('verify_cert', $config) && $config['verify_cert']))
            putenv("LDAPTLS_REQCERT=never");

        // We need to connect to the LDAP Unipi server to authenticate the user.
        $ds = ldap_connect($config['ldap_server_uri']);

        if (! $ds) {
            return false;
        }

        ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

        $base_dn = array_get($config, 'base_dn', array_get($config, 'admin_base_dn'));
        $bind_dn = "uid=" . $data['username'] . "," . $base_dn;
        $r = @ldap_bind($ds, $bind_dn, $data['password']);

        if (! $r) {
            return false;
        }

        // Search for the user in the tree
        $results = ldap_search($ds, $base_dn, "uid=" . $data['username']);

        if (ldap_count_entries($ds, $results) == 0) {
            return false;
        }

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
            'admin' => in_array($data['username'], $config['admins']),
            'email' => $m['mail'][0]
        ];
    }
}
