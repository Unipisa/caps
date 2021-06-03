<?php
namespace App\Test\TestCase\Controller;

use App\Test\TestCase\Controller\MyIntegrationTestCase;
use Cake\ORM\TableRegistry;

/**
 * ExamsControllerTest class
 */
class ExamsControllerTest extends MyIntegrationTestCase
{
    public $fixtures = ['app.Users', 'app.Exams', 'app.Groups', 'app.ExamsGroups', 'app.Settings', 'app.Tags', 'app.TagsExams' ];

    public function setUp(): void
    {
        parent::setUp();
        $this->Exams = TableRegistry::getTableLocator()->get('Exams');
    }

    public function testExamsPage()
    {
        $this->get('/exams');
        $this->assertRedirect();
        $this->assertRedirectContains('?redirect=%2Fexams');

        // test that page requires authentication
        $this->get('/exams/index');
        $this->assertRedirect();
        $this->assertRedirectContains('?redirect=%2Fexams%2Findex');

        $this->enableCsrfToken();
        $this->enableSecurityToken();

        // test that students are not allowed to POST
        $this->studentSession();
        $this->post('/exams/index');
        $this->assertResponseForbidden(); 

        // test that admin can access (but also students can!)
        $this->adminSession();
        $this->get('/exams/index');
        $this->assertResponseOk();

        // load page to add new axam
        $this->get('/exams/edit');
        $this->assertResponseOk();

        // add new exam
        $exam_count = $this->Exams->find()->count();
        $this->post('/exams/edit', [
          'name' => 'Analisi Matematica',
          'code' => '1111',
          'sector' => 'AAA',
          'credits' => 17
        ]);
        $this->assertRedirect();
        $this->assertFlashMessage('Esame aggiunto con successo.');
        $this->assertEquals($exam_count + 1, $this->Exams->find()->count());

        // edit exam
        $exam_id = $this->Exams->find()->first()['id'];
        $this->get("/exams/edit/$exam_id");
        $this->assertResponseOk();

        // debug($this->_response);
    }
}
