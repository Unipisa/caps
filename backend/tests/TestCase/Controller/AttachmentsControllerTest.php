<?php
namespace App\Test\TestCase\Controller;

use App\Controller\AttachmentsController;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * App\Controller\AttachmentsController Test Case
 *
 * @uses \App\Controller\AttachmentsController
 */
class AttachmentsControllerTest extends MyIntegrationTestCase
{
    use IntegrationTestTrait;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.Users',
        'app.Proposals',
        'app.Settings',
        'app.Attachments',
        'app.FormTemplates'
    ];

    /**
     * Test view method
     *
     * @return void
     */
    public function testViewFromOwnerAndAdmin()
    {
        // Ok because this is the owner
        $this->studentSession();
        $this->get('/attachments/view/1');
        $this->assertResponseOk();

        $this->adminSession();
        $this->get('/attachments/view/1');
        $this->assertResponseOk();
    }

    public function testViewFromOther() {
        $this->studentSession(3);
        $this->get('/attachments/view/1');
        $this->assertResponseForbidden();
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

    /**
     * Test delete method
     *
     * @return void
     */
    public function testDelete()
    {
        $this->enableSecurityToken();
        $this->enableCsrfToken();
        $this->studentSession(1);
        $this->post('/attachments/delete/1');

        $this->assertRedirect();
    }

    public function testAdminDelete() {
        $this->enableSecurityToken();
        $this->enableCsrfToken();
        $this->adminSession(1);
        $this->post('/attachments/delete/1');

        $this->assertRedirect();
    }
}
