<?php
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;

class MyIntegrationTestCase extends TestCase
{
    use IntegrationTestTrait;

    function assertResponseForbidden($msg=null) {
        return $this->assertResponseCode(403, $msg);
    }

    function studentSession() 
    {
        $this->session([
            'Auth' => [
                'User' => [
                    'id' => 1,
                    'username' => 'mario.rossi', // see UsersFixture.php
                    'ldap_dn' => '',
                    'name' => 'MARIO ROSSI',
                    'number' => '123456',
                    'admin' => false,
                    'surname' => '',
                    'givenname' => ''
                ]
            ]
        ]);
    }

    function adminSession()
    {
        $this->session([
            'Auth' => [
                'User' => [
                    'id' => 2,
                    'username' => 'alice.verdi', // see UsersFixture.php
                    'ldap_dn' => '',
                    'name' => 'ALICE VERDI',
                    'number' => '24680',
                    'admin' => true,
                    'surname' => '',
                    'givenname' => ''
                ]
            ]
        ]);
    }
}

