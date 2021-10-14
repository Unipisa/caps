<?php
/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @since         1.2.0
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\ORM\TableRegistry;

/**
 * UsersControllerTest class
 */
class UsersControllerTest extends TestCase
{
    use IntegrationTestTrait;
    
    public $fixtures = [
        'app.Users', 
        'app.Proposals', 
        'app.Curricula', 
        'app.CurriculaProposals',
        'app.Forms',
        'app.FormTemplates'
    ];

    public function setUp(): void
    {
        parent::setUp();
        $this->Users = TableRegistry::getTableLocator()->get('Users');
    }

    public function testFixture()
    {
        $user = $this->Users->get(1);
        $this->assertEquals("Mario Rossi", $user->name);
    }

    /**
     * testMultipleGet method
     *
     * @return void
     */
    public function testMultipleGet()
    {
        $this->get('/');
        $this->assertResponseOk();
        $this->get('/');
        $this->assertResponseOk();
    }

    /**
     * testLoginPage method
     *
     * @return void
     */
    public function testLoginPage()
    {
        $this->get('/');
        $this->assertResponseOk();
        $this->assertResponseContains('Effettua il login');
        $this->assertResponseContains('<html>');
    }

    /**
     * testUsersPage method
     *
     * @return void
     */
    public function testUsersPage()
    {
        // test that page requires authentication
        $this->get('/users/view');
        $this->assertRedirect();
        $this->assertRedirectContains('?redirect=%2Fusers%2Fview');

        // Set session data
        $user = TableRegistry::getTableLocator()->get('Users')->get(1);
        $this->session([ 'Auth' => $user ]);

        $this->get('/users/view');
        $this->assertResponseContains('matricola: 123456');
    }
}
