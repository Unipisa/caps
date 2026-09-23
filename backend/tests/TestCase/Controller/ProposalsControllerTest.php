<?php
namespace App\Test\TestCase\Controller;

use Cake\TestSuite\EmailTrait;
use Cake\TestSuite\IntegrationTestTrait;

/**
 * UsersControllerTest class
 */
class ProposalsControllerTest extends MyIntegrationTestCase
{
    use EmailTrait;
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
            'app.Groups',
            'app.Settings',
            'app.Attachments',
            'app.ProposalAuths',
            'app.ChosenExams',
            'app.ChosenFreeChoiceExams',
            'app.CompulsoryExams',
            'app.CompulsoryGroups',
            'app.FreeChoiceExams',
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

    public function testAdminApproveSendsConfiguredEmail(): void
    {
        $this->adminSession();

        $this->get('/proposals/admin-approve/1');

        $this->assertRedirect('/proposals/view/1');
        $this->assertMailCount(1);
        $this->assertMailSentTo('mario.rossi@rossi.com');
        $this->assertMailSubjectContains('Piano di studi approvato');
    }
}
