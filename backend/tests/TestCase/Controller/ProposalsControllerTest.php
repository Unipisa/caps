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

    public function testDuplicateCreatesIndependentDraft(): void
    {
        $proposals = $this->getTableLocator()->get('Proposals');
        $exams = $this->getTableLocator()->get('Exams');
        $exam = $exams->saveOrFail($exams->newEntity([
            'name' => 'Algebra', 'code' => 'ALG', 'sector' => 'MAT/02', 'credits' => 6,
        ]));
        $original = $proposals->get(1);
        $original->state = 'approved';
        $original->note = 'Keep this note';
        $proposals->saveOrFail($original);
        $chosenExams = $this->getTableLocator()->get('ChosenExams');
        $chosenExams->saveOrFail($chosenExams->newEntity([
            'proposal_id' => 1, 'exam_id' => $exam->id, 'credits' => 6, 'chosen_year' => 2,
        ]));
        $freeChoiceExams = $this->getTableLocator()->get('ChosenFreeChoiceExams');
        $freeChoiceExams->saveOrFail($freeChoiceExams->newEntity([
            'proposal_id' => 1, 'name' => 'Optional course', 'credits' => 3, 'chosen_year' => 1,
        ]));
        $contain = ['ChosenExams', 'ChosenFreeChoiceExams'];
        $originalData = $proposals->get(1, contain: $contain)->toArray();

        $this->studentSession();
        $this->get('/proposals/duplicate/1');

        $this->assertResponseCode(302);
        $this->assertSame(2, $proposals->find()->count());
        $copy = $proposals->find()->where(['id !=' => 1])->contain($contain)->firstOrFail();
        $this->assertRedirect('/proposals/edit/' . $copy->id);
        $this->assertSame('draft', $copy->state);
        $this->assertNull($copy->submitted_date);
        $this->assertNull($copy->approved_date);
        $this->assertSame($original->user_id, $copy->user_id);
        $this->assertSame($original->curriculum_id, $copy->curriculum_id);
        $this->assertSame($original->note, $copy->note);
        foreach (['chosen_exams', 'chosen_free_choice_exams'] as $association) {
            $this->assertCount(1, $copy->$association);
            $selection = $copy->$association[0]->toArray();
            $originalSelection = $originalData[$association][0];
            $this->assertNotSame($originalSelection['id'], $selection['id']);
            $this->assertSame($copy->id, $selection['proposal_id']);
            unset($selection['id'], $selection['proposal_id']);
            unset($originalSelection['id'], $originalSelection['proposal_id']);
            $this->assertSame($originalSelection, $selection);
        }
        $this->assertEquals($originalData, $proposals->get(1, contain: $contain)->toArray());
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
