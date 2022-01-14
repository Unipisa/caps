<?php
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\TestCase;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\ORM\TableRegistry;
use App\Test\TestCase\Controller\MyIntegrationTestCase;

/**
 * UsersControllerTest class
 */
class ProposalsControllerTest extends MyIntegrationTestCase
{
    use IntegrationTestTrait;

    public $fixtures = [
            'app.Users',
            'app.Proposals',
            'app.Curricula',
            'app.Degrees',
            'app.Tags', 
            'app.TagsExams',
            'app.Exams',
            'app.ExamsGroups', 
            'app.Groups'
    ];

    public function setUp(): void
    {
        parent::setUp();
    }

    public function testProposalPage()
    {
        // test that page requires authentication
        foreach (['/proposals/edit', '/exams.json'] as $url) {
            $this->get($url);
            $this->assertRedirect();
        }

        // Set session data
        $this->studentSession();

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
