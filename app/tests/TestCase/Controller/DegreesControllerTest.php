<?php
namespace App\Test\TestCase\Controller;

use Cake\ORM\TableRegistry;

/**
 * App\Controller\DegreesController Test Case
 *
 * @uses \App\Controller\DegreesController
 */
class DegreesControllerTest extends MyIntegrationTestCase
{
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.Degrees',
        'app.Curricula',
        'app.Settings',
        'app.Users',
        'app.Groups'
    ];

    /**
     * Test index method
     *
     * @return void
     */
    public function testIndex()
    {
        // test that page requires authentication

        $this->get('degrees');
        $this->assertRedirect();
        $this->assertRedirectContains('?redirect=%2Fdegrees');

        $this->get('/degrees/index');
        $this->assertRedirect();
        $this->assertRedirectContains('?redirect=%2Fdegrees%2Findex');

        // debug($this->_response);
        // $this->assertResponseContains('Effettua il login usando le credenziali di Ateneo.');   
    }

    public function testEdit()
    {
        $this->enableCsrfToken();
        $this->enableSecurityToken();
        $this->studentSession();
        $this->post('degrees/edit');
        $this->assertResponseForbidden();
    }

    /**
     * Test delete method
     *
     * @return void
     */
    public function testDelete()
    {
        $this->enableCsrfToken();
        $this->enableSecurityToken();
        $this->studentSession();
        $this->post('degrees/delete/1');
        $this->assertResponseForbidden();
    }

    /**
     * Test view method
     *
     * @return void
     */
    public function testView()
    {
        $this->Degrees = TableRegistry::getTableLocator()->get('Degrees');
        $this->adminSession();
        $this->get('degrees/view/1');
        $this->assertResponseOK();
    }

    /**
     * Test add method
     *
     * @return void
     */
    public function testAdd()
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

}
