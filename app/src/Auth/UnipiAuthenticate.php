<?php


// namespace App\Controller\Component\Auth;
namespace App\Auth;

use Cake\Auth\BaseAuthenticate;
use Cake\Http\Response;
use Cake\Http\ServerRequest;

class UnipiAuthenticate extends BaseAuthenticate {

    public function getConfig($key = NULL, $default = NULL) {
        $config = parse_ini_file (APP . DS . ".." . DS . "unipi.ini");
        return $config;
    }

    public function authenticate(ServerRequest $request, Response $response) {
        $config = $this->getConfig();
        $data = $request->data;

        /*
        if ($user['username'] == 'admin') {
            return array (
                'ldap_dn' => '',
                'user' => $user['username'],
                'name' => 'Carlo Petronio',
                'role' => 'professor',
                'admin' => in_array($user['username'], $config['admins'])
            );
        } else {
            return array (
                'ldap_dn' => '',
                'user' => $user['username'],
                'name' => 'Jacopo Notarstefano',
                'role' => 'student',
                'admin' => in_array($user['username'], $config['admins'])
            );
        }
        */

        // Allow Carlo Petronio and Matteo Novaga to browse as a student.
        if (in_array($data['username'], $config['fakes']) && $data['password'] == $data['username']) {
            return array (
                'ldap_dn' => '',
                'user' => $data['username'],
                'name' => 'Utente Dimostrativo',
                'role' => 'student',
                'number' => '000000',
                'admin' => in_array($data['username'], $config['admins'])
            );
        }

        // Terrible hack because the SSL certificate on the Unipi side is not
        // validated by a publicy available CA.
        putenv("LDAPTLS_REQCERT=never");

        // We need to connect to the LDAP Unipi server to authenticate the user.
        $ds = ldap_connect($config['ldap_server_uri']);
        ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

        if ($ds) {
            // Bind to the server using our superadmin powers
            $r = ldap_bind($ds, $config['bind_dn'], $config['bind_pw']);

            if (!$r) {
                return false;
            }

            // Search for the user in the tree
            $results = ldap_search($ds, "dc=unipi,dc=it", "uid=" . $data['username']);

            if (ldap_count_entries ($ds, $results) == 0) {
                return false;
            }

            $matches = ldap_get_entries ($ds, $results);

            // Check if the password matches
            $m = $matches[0];
            $hash = $m['userpassword'][0];

            if (! $this->check_password($data['password'], $hash)) {
                return false;
            }

            // Determine the role
            if (preg_match('/,dc=dm,ou=people,dc=unipi,dc=it/', $m['dn'])) {
                $role = 'professor';
            }
            else {
                $role = 'student';
            }

            // If we got till here then the user can be logged in. Just make sure that we build up
            // an array of its properties so we can use them after now.
            return array (
                'ldap_dn' => $m['dn'],
                'user' => $data['username'],
                'name' => $m['cn'][0],
                'number' => $m['unipistudentematricola'][0],
                'role' => $role,
                'admin' => in_array($data['username'], $config['admins'])
            );
        }

        return false;
    }

    /**
     * @brief Check the given password agains its (hopefully) hash.
     */
    private function check_password($password, $hash)
    {
        // No password, fail
        if ($hash == '') {
            return false;
        }

        // Plaintex password
        if ($hash{0} != '{') {
            if ($password == $hash)
                return true;
                return false;
        }

        if (substr($hash,0,7) == '{crypt}') {
            if (crypt($password, substr($hash,7)) == substr($hash,7))
                return true;
            return false;
        }
        elseif (substr($hash,0,5) == '{MD5}') {
            $encrypted_password = '{MD5}' . base64_encode(md5( $password,TRUE));
        } elseif (substr($hash,0,6) == '{SHA1}') {
            $encrypted_password = '{SHA}' . base64_encode(sha1( $password, TRUE ));
        } elseif (substr($hash,0,5) == '{SHA}') {
            $encrypted_password = '{SHA}' . base64_encode(sha1( $password, TRUE ));
        } elseif (substr($hash,0,6) == '{SSHA}') {
            $salt = substr(base64_decode(substr($hash,6)),20);
            $encrypted_password = '{SSHA}' . base64_encode(sha1( $password.$salt, TRUE ). $salt);
        }
        else
        {
            // Unsupported hash :(
            return false;
        }

        if ($hash == $encrypted_password)
            return true;

        return false;
    }

}
