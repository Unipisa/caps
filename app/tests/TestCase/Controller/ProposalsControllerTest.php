<?php
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;
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
        foreach (['/proposals/edit', '/exams.json'] as $url) {
            $this->get($url);
            $this->assertRedirect();
        }

//        $this->get('/proposals/view/1000/');
//        debug($this->_response);
//        $this->assertResponseOk();
        // $auth = TableRegistry::getTableLocator()->get('ProposalAuths')->get(1);

        // Set session data
        $user = TableRegistry::getTableLocator()->get('Users')->get(1);
        $this->session([ 'Auth' => $user ]);

        $this->get('/proposals/edit');
        $this->assertResponseOk();

        $this->get('/exams.json');
        $this->assertResponseOk();

        $this->get('/groups.json');
        $this->assertResponseOk();

        $this->get('/curricula.json');
        $this->assertResponseOk();
    }
}
