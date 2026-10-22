<?php
declare(strict_types=1);
namespace App\Test\TestCase\Command;

use App\Utility\LegacyThesisDefenseImporter;
use Cake\Console\TestSuite\ConsoleIntegrationTestTrait;
use Cake\TestSuite\TestCase;

class ImportThesisDefensesCommandTest extends TestCase
{
    use ConsoleIntegrationTestTrait;

    public array $fixtures = [
        'app.Users', 'app.FormTemplates', 'app.Forms', 'app.FormAttachments',
        'app.DegreeSessions', 'app.ThesisDefenses', 'app.ThesisDefenseAdvisors', 'app.ThesisDefenseAttachments',
    ];

    private function seed(string $state = 'approved', array $changes = []): void
    {
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $sessions->saveOrFail($sessions->newEntity([
            'type' => 'master', 'name' => 'Ottobre', 'start_date' => '2026-10-13',
            'ask_bachelor_university' => false, 'ask_second_examiners' => false,
        ]));
        $data = $changes + [
            'titolo' => 'Tesi di esempio', 'data' => '13/10/2026',
            'anno_immatricolazione' => '2020', 'laurea_triennale' => 'Matematica',
            'conseguimento_lt' => 'Pisa', 'tel_cellulare' => '12345',
            'relatore' => 'Mario Rossi', 'email_relatore' => 'mario@example.org',
            'altri_relatori' => 'Anna, Luca', 'controrelatore_1' => 'Luigi',
            'display_pubblico' => 'si',
        ];
        $forms = $this->getTableLocator()->get('Forms');
        $forms->updateAll([
            'state' => $state, 'date_submitted' => '2026-10-01 00:00:00',
            'date_managed' => '2026-10-02 12:00:00', 'data' => json_encode($data),
        ], ['id' => 1]);
        $attachments = $this->getTableLocator()->get('FormAttachments');
        $attachment = $attachments->newEntity([
            'form_id' => 1, 'user_id' => 1, 'filename' => 'abstract.pdf',
            'mimetype' => 'application/pdf', 'data' => 'PDF bytes', 'comment' => 'Original comment',
        ], ['validate' => false]);
        $attachment->set('mimetype', 'application/pdf');
        $attachments->saveOrFail($attachment);
    }

    public function testImportPreservesDataAndIsIdempotent(): void
    {
        $this->seed();
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitSuccess();
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        $defense = $defenses->find()->firstOrFail();
        $this->assertSame(1, $defense->source_form_id);
        $this->assertSame('approved', $defense->state);
        $this->assertSame('2026-10-01 00:00:00', $defense->submitted_at->format('Y-m-d H:i:s'));
        $this->assertSame('Matematica', $defense->bachelor_degree);
        $this->assertSame('Luigi', $defense->proposed_second_examiners);
        $this->assertTrue($defense->public);
        $this->assertSame(2, $this->getTableLocator()->get('ThesisDefenseAdvisors')->find()->count());
        $copy = $this->getTableLocator()->get('ThesisDefenseAttachments')->find()->firstOrFail();
        $bytes = is_resource($copy->data) ? stream_get_contents($copy->data) : $copy->data;
        $this->assertSame('PDF bytes', $bytes);
        $this->assertSame(1, $this->getTableLocator()->get('Forms')->find()->count());
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitSuccess();
        $this->assertSame(1, $defenses->find()->count());
    }

    public function testDryRunRollsBackAllRecords(): void
    {
        $this->seed();
        $this->exec('import_thesis_defenses 1 2026-10-01 master --dry-run');
        $this->assertExitSuccess();
        foreach (['ThesisDefenses', 'ThesisDefenseAdvisors', 'ThesisDefenseAttachments'] as $table) {
            $this->assertSame(0, $this->getTableLocator()->get($table)->find()->count());
        }
    }

    public function testInvalidAdvisorRollsBackDefense(): void
    {
        $this->seed('approved', ['email_relatore' => 'invalid']);
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitError();
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenses')->find()->count());
    }

    public function testFiltersExcludeDraftsOlderDatesAndOtherTemplates(): void
    {
        $this->seed('draft');
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitSuccess();
        $forms = $this->getTableLocator()->get('Forms');
        $forms->updateAll(['state' => 'approved'], ['id' => 1]);
        $this->exec('import_thesis_defenses 1 2026-10-02 master');
        $this->assertExitSuccess();
        $templates = $this->getTableLocator()->get('FormTemplates');
        $template = $templates->newEntity(['name' => 'Altro', 'text' => 'Test'], ['validate' => false]);
        $templates->saveOrFail($template);
        $this->exec("import_thesis_defenses {$template->id} 2026-10-01 master");
        $this->assertExitSuccess();
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenses')->find()->count());
    }

    public function testMissingSessionFailsAndOverrideWorks(): void
    {
        $this->seed('approved', ['data' => '2026-11-13']);
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitError();
        $session = $this->getTableLocator()->get('DegreeSessions')->find()->firstOrFail();
        $this->exec("import_thesis_defenses 1 2026-10-01 master --session-id {$session->id}");
        $this->assertExitSuccess();
    }

    public function testInvalidDateIsRejected(): void
    {
        $this->exec('import_thesis_defenses 1 2026-02-30 master');
        $this->assertExitError();
    }

    public function testDryRunDetectsConflictsAndContinuesAfterRollback(): void
    {
        $this->seed('submitted');
        $forms = $this->getTableLocator()->get('Forms');
        foreach (['submitted', 'approved'] as $state) {
            $copy = clone $forms->get(1);
            $copy->unset('id');
            $copy->setNew(true);
            $copy->set('state', $state);
            foreach (array_keys($copy->toArray()) as $field) {
                $copy->setDirty($field, true);
            }
            $forms->saveOrFail($copy);
        }
        $this->exec('import_thesis_defenses 1 2026-10-01 master --dry-run');
        $this->assertExitError();
        $this->assertOutputContains('Convertiti: 2; già convertiti: 0; errori: 1.');
        foreach (['ThesisDefenses', 'ThesisDefenseAdvisors', 'ThesisDefenseAttachments'] as $table) {
            $this->assertSame(0, $this->getTableLocator()->get($table)->find()->count());
        }
    }

    public function testAmbiguousSessionsAreRejected(): void
    {
        $this->seed();
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $sessions->saveOrFail($sessions->newEntity([
            'type' => 'master', 'name' => 'Secondo appello', 'start_date' => '2026-10-13',
        ]));
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitError();
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenses')->find()->count());
    }

    public function testNestedJson(): void
    {
        $data = ['titolo' => 'Esempio'];
        $this->assertSame($data, LegacyThesisDefenseImporter::decodeData(json_encode(json_encode($data))));
    }
}
