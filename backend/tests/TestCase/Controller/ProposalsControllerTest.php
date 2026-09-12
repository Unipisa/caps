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

    public array $fixtures = [
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

        $this->configRequest(['headers' => ['Accept' => 'application/json']]);

        $this->get('/exams');
        $this->assertResponseOk();

        $this->get('/groups');
        $this->assertResponseOk();

        $this->get('/curricula');
        $this->assertResponseOk();
    }
}
