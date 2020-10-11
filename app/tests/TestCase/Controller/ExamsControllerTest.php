<?php
namespace App\Test\TestCase\Controller;

use App\Controller\ExamsController;
use Cake\Core\App;
use Cake\Core\Configure;
use Cake\Http\Response;
use Cake\Http\ServerRequest;
use Cake\TestSuite\IntegrationTestCase;
use Cake\View\Exception\MissingTemplateException;
use Cake\ORM\TableRegistry;

/**
 * ExamsControllerTest class
 */
class ExamsControllerTest extends IntegrationTestCase
{
    public $fixtures = ['app.Users', 'app.Exams', 'app.Groups', 'app.ExamsGroups', 'app.Settings', 'app.Tags', 'app.TagsExams' ];

    public function setUp()
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

        // test that students are not allowed to access
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
        $this->post('/exams/index');
        $this->assertResponseError(); // ma dovrebbe essere ResponseFailure?

        // test that admin can access
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
        $this->get('/exams/index');
        $this->assertResponseOk();

        // load page to add new axam
        $this->enableCsrfToken();
        $this->enableSecurityToken();
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

        // $this->disableErrorHandlerMiddleware();        // test that page requires authentication
        // fwrite(STDERR,'****'.print_r($this->_flashMessages,true));
    }
}
