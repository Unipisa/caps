<?php
namespace App\Test\TestCase\Controller;

use Cake\ORM\TableRegistry;
use Cake\TestSuite\EmailTrait;
use Cake\TestSuite\IntegrationTestTrait;
use Laminas\Diactoros\UploadedFile;

/**
 * App\Controller\AttachmentsController Test Case
 *
 */
class AttachmentsControllerTest extends MyIntegrationTestCase
{
    use EmailTrait;
    use IntegrationTestTrait;

    /**
     * Fixtures
     *
     * @var array
     */
    public array $fixtures = [
        'app.Users',
        'app.Proposals',
        'app.Settings',
        'app.Attachments',
        'app.FormTemplates',
        'app.Curricula',
        'app.Degrees',
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
        $degrees = TableRegistry::getTableLocator()->get('Degrees');
        $degree = $degrees->get(1);
        $degree->attachment_confirmation = true;
        $degrees->saveOrFail($degree);

        $stream = fopen('php://memory', 'r+');
        $upload = new UploadedFile($stream, 0, UPLOAD_ERR_OK, '', 'application/octet-stream');

        $this->enableSecurityToken();
        $this->enableCsrfToken();
        $this->studentSession(1);
        $this->configRequest(['files' => ['data' => $upload]]);
        $this->post('/attachments/add', [
            'proposal_id' => 1,
            'comment' => 'Test comment',
        ]);

        $this->assertRedirect('/proposals/view/1');
        $this->assertMailCount(1);
        $this->assertMailSentTo('mario.rossi@rossi.com');
        $this->assertMailSubjectContains('Allegato/commento aggiunto');
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
