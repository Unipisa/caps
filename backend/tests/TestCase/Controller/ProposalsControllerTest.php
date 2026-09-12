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

    public function testJsonExportUsesConfiguredFields(): void
    {
        $this->adminSession();
        $this->get('/proposals/index.json');

        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true);
        $this->assertNotEmpty($data);
        $this->assertArrayHasKey('note', $data[0]);
        $this->assertArrayHasKey('user', $data[0]);
        $this->assertArrayHasKey('curriculum', $data[0]);
        $this->assertArrayNotHasKey('password', $data[0]['user']);
        $this->assertSame(
            ['id', 'name', 'academic_year'],
            array_keys($data[0]['curriculum']['degree'])
        );
    }
}
