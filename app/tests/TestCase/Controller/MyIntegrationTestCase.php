<?php
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\ORM\TableRegistry;

class MyIntegrationTestCase extends TestCase
{
    use IntegrationTestTrait;

    function assertResponseForbidden($msg = "") {
        return $this->assertResponseCode(403, $msg);
    }

    function studentSession()
    {
        $user = TableRegistry::getTableLocator()->get('Users')->get(1);
        $this->session([ 'Auth' => $user ]);
    }

    function adminSession()
    {
        $user = TableRegistry::getTableLocator()->get('Users')->get(2);
        $this->session([ 'Auth' => $user ]);
    }
}

