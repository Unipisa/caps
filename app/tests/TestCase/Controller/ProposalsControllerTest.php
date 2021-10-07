<?php
namespace App\Test\TestCase\Controller;

use App\Controller\ProposalsController;
use Cake\Core\App;
use Cake\Core\Configure;
use Cake\Http\Response;
use Cake\Http\ServerRequest;
use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\View\Exception\MissingTemplateException;
use Cake\ORM\TableRegistry;

/**
 * UsersControllerTest class
 */
class ProposalsControllerTest extends TestCase
{
    use IntegrationTestTrait;

    public $fixtures = [
            'app.Users',
            'app.Proposals',
            'app.Curricula',
            'app.CurriculaProposals',
            'app.Degrees',
            'app.Exams',
            'app.Groups',
            'app.Settings',
            'app.Tags'
    ];

    public function setUp(): void
    {
        parent::setUp();
        $this->Users = TableRegistry::getTableLocator()->get('Users');
    }

    public function testProposalPage()
    {
        // test that page requires authentication
        foreach (['/proposals/add', '/exams.json'] as $url) {
            $this->get($url);
            $this->assertRedirect();
        }

        // Set session data
        $user = TableRegistry::getTableLocator()->get('Users')->get(1);
        $this->session([ 'Auth' => $user ]);

        $this->get('/proposals/add');
        $this->assertResponseOk();

        $this->get('/exams.json');
        $this->assertResponseOk();

        $this->get('/groups.json');
        $this->assertResponseOk();

        $this->get('/curricula.json');
        $this->assertResponseOk();
    }
}
