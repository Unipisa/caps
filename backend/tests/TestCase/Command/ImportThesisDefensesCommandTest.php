<?php
declare(strict_types=1);
namespace App\Test\TestCase\Command;

use App\Utility\LegacyThesisDefenseImporter;
use Cake\Console\TestSuite\ConsoleIntegrationTestTrait;
use Cake\TestSuite\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

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

    public function testCommentsWithoutFilesAreSkippedAndPreservedOnOriginalForm(): void
    {
        $this->seed();
        $attachments = $this->getTableLocator()->get('FormAttachments');
        foreach ([null, ''] as $filename) {
            $comment = $attachments->newEntity([
                'form_id' => 1, 'user_id' => 1, 'filename' => $filename,
                'data' => '', 'comment' => 'Preferisco discutere nel pomeriggio.',
            ], ['validate' => false]);
            $comment->set('mimetype', '');
            $attachments->saveOrFail($comment);
        }

        $this->exec('import_thesis_defenses 1 2026-10-01 master --dry-run');
        $this->assertExitSuccess();
        $copies = $this->getTableLocator()->get('ThesisDefenseAttachments');
        $this->assertSame(0, $copies->find()->count());

        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitSuccess();
        $this->assertSame(1, $copies->find()->count());
        $copy = $copies->find()->firstOrFail();
        $this->assertSame('abstract.pdf', $copy->filename);
        $this->assertSame('application/pdf', $copy->mimetype);
        $this->assertSame('PDF bytes', is_resource($copy->data) ? stream_get_contents($copy->data) : $copy->data);
        $this->assertSame(3, $attachments->find()->count());
        $this->assertSame(2, $attachments->find()->where([
            'comment' => 'Preferisco discutere nel pomeriggio.',
        ])->count());
    }

    public function testFileWithMissingMetadataIsNotSilentlySkipped(): void
    {
        $this->seed();
        $this->getTableLocator()->get('FormAttachments')->updateAll([
            'filename' => null, 'mimetype' => '',
        ], ['form_id' => 1]);
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $this->assertExitError();
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenses')->find()->count());
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenseAttachments')->find()->count());
        $this->assertSame(1, $this->getTableLocator()->get('FormAttachments')->find()->count());
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

    public static function enrollmentYearValues(): array
    {
        return [
            ['2024', 2024], ['2021/2022', 2021], ['2024/2025', 2024],
            ['2023/24', 2023], ['2020/2021', 2020], [' 2023 / 24 ', 2023],
            ['1999/00', 1999],
            ['2023/25', null], ['2023/2022', null], ['2023/2025', null],
            ['', null], ['invalid', null], ['2023abc', null], ['1899/1900', null],
        ];
    }

    #[DataProvider('enrollmentYearValues')]
    public function testEnrollmentYearConversionPreservesOriginalData(string $value, ?int $expected): void
    {
        $this->seed('approved', ['anno_immatricolazione' => $value]);
        $this->exec('import_thesis_defenses 1 2026-10-01 master');
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        if ($expected === null) {
            $this->assertExitError();
            $this->assertSame(0, $defenses->find()->count());
        } else {
            $this->assertExitSuccess();
            $this->assertSame($expected, $defenses->find()->firstOrFail()->enrollment_year);
        }
        $original = $this->getTableLocator()->get('Forms')->get(1);
        $this->assertSame($value, LegacyThesisDefenseImporter::decodeData($original->data)['anno_immatricolazione']);
    }

    private function copyForm(array $changes = []): \App\Model\Entity\Form
    {
        $forms = $this->getTableLocator()->get('Forms');
        $copy = clone $forms->get(1);
        $copy->unset('id');
        $copy->setNew(true);
        foreach ($changes as $field => $value) {
            $copy->set($field, $value);
        }
        foreach (array_keys($copy->toArray()) as $field) {
            $copy->setDirty($field, true);
        }
        $forms->saveOrFail($copy);
        return $copy;
    }

    public static function duplicateSubmissionDates(): array
    {
        return [
            'later submission' => ['2026-10-02 00:00:00', true],
            'same timestamp uses higher ID' => ['2026-10-01 00:00:00', true],
            'higher ID but older submission' => ['2026-09-30 00:00:00', false],
        ];
    }

    #[DataProvider('duplicateSubmissionDates')]
    public function testLatestDuplicateIsKeptWithWarning(string $submittedAt, bool $copyWins): void
    {
        $this->seed('submitted');
        $copy = $this->copyForm(['date_submitted' => $submittedAt]);
        $winner = $copyWins ? $copy->id : 1;
        $loser = $copyWins ? 1 : $copy->id;
        $this->getTableLocator()->get('FormAttachments')->updateAll(['form_id' => $winner], ['form_id' => 1]);
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        $attachments = $this->getTableLocator()->get('ThesisDefenseAttachments');
        $this->exec('import_thesis_defenses 1 2026-09-20 master --dry-run');
        $this->assertExitSuccess();
        $this->assertErrorContains("Modulo $loser: duplicato ignorato; mantenuto il modulo più recente $winner");
        $this->assertOutputContains('duplicati ignorati: 1.');
        $this->assertSame(0, $defenses->find()->count());
        $this->assertSame(0, $attachments->find()->count());
        $this->exec('import_thesis_defenses 1 2026-09-20 master');
        $this->assertExitSuccess();
        $this->assertSame(1, $defenses->find()->count());
        $this->assertSame($winner, $defenses->find()->firstOrFail()->source_form_id);
        $this->assertSame(1, $attachments->find()->count());
        $this->assertSame(2, $this->getTableLocator()->get('Forms')->find()->count());
        $this->exec('import_thesis_defenses 1 2026-09-20 master');
        $this->assertExitSuccess();
        $this->assertSame(1, $defenses->find()->count());
    }

    public function testInvalidLatestDuplicateDoesNotFallBackToOlderSubmission(): void
    {
        $this->seed();
        $data = LegacyThesisDefenseImporter::decodeData($this->getTableLocator()->get('Forms')->get(1)->data);
        $data['email_relatore'] = 'invalid';
        $this->copyForm(['data' => json_encode($data), 'date_submitted' => '2026-10-02 00:00:00']);
        $this->exec('import_thesis_defenses 1 2026-09-20 master');
        $this->assertExitError();
        $this->assertErrorContains('Modulo 1: duplicato ignorato');
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenses')->find()->count());
    }

    public function testDifferentSessionsAreNotDuplicatesUnlessOverridden(): void
    {
        $this->seed();
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $session = $sessions->saveOrFail($sessions->newEntity([
            'type' => 'master', 'name' => 'Novembre', 'start_date' => '2026-11-13',
        ]));
        $data = LegacyThesisDefenseImporter::decodeData($this->getTableLocator()->get('Forms')->get(1)->data);
        $data['data'] = '2026-11-13';
        $copy = $this->copyForm(['data' => json_encode($data), 'date_submitted' => '2026-10-02 00:00:00']);
        $this->exec('import_thesis_defenses 1 2026-09-20 master --dry-run');
        $this->assertExitSuccess();
        $this->assertOutputContains('Convertiti: 2; già convertiti: 0; errori: 0; duplicati ignorati: 0.');
        $this->exec("import_thesis_defenses 1 2026-09-20 master --session-id {$session->id}");
        $this->assertExitSuccess();
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        $this->assertSame(1, $defenses->find()->count());
        $this->assertSame($copy->id, $defenses->find()->firstOrFail()->source_form_id);
    }

    public function testDryRunDetectsConflictsAndContinuesAfterRollback(): void
    {
        $this->seed('submitted');
        $forms = $this->getTableLocator()->get('Forms');
        foreach (['submitted', 'approved'] as $index => $state) {
            $day = '2026-11-' . (13 + $index);
            $sessions = $this->getTableLocator()->get('DegreeSessions');
            $sessions->saveOrFail($sessions->newEntity([
                'type' => 'master', 'name' => $day, 'start_date' => $day,
            ]));
            $data = LegacyThesisDefenseImporter::decodeData($forms->get(1)->data);
            $data['data'] = $day;
            $this->copyForm(['state' => $state, 'data' => json_encode($data)]);
        }
        $this->exec('import_thesis_defenses 1 2026-10-01 master --dry-run');
        $this->assertExitError();
        $this->assertOutputContains('Convertiti: 2; già convertiti: 0; errori: 1; duplicati ignorati: 0.');
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
