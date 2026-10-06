<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use Cake\I18n\DateTime;
use Cake\TestSuite\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

class ThesisDefensesTableTest extends TestCase
{
    public array $fixtures = ['app.DegreeSessions', 'app.ThesisDefenses', 'app.Users'];

    public static function optionalFields(): array
    {
        return [
            [true, true, 'Università di Pisa', 'Mario Rossi'],
            [false, true, 'Università di Pisa', 'Mario Rossi'],
            [true, false, 'Università di Pisa', 'Mario Rossi'],
            [false, false, 'Università di Pisa', 'Mario Rossi'],
            [false, true, null, null],
            [false, true, '', ''],
        ];
    }

    #[DataProvider('optionalFields')]
    public function testOptionalFieldsRespectSessionSettings(bool $universityEnabled, bool $examinersEnabled, ?string $university, ?string $examiners): void
    {
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $session = $sessions->newEntity([
            'type' => 'master', 'name' => 'Sessione', 'start_date' => '2027-01-01',
            'ask_bachelor_university' => $universityEnabled,
            'ask_second_examiners' => $examinersEnabled,
        ]);
        $sessions->saveOrFail($session);
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        $defense = $defenses->newEntity([
            'degree_session_id' => $session->id, 'user_id' => 1,
            'enrollment_year' => 2020, 'bachelor_degree' => 'Matematica',
            'title' => 'Tesi', 'state' => 'submitted', 'submitted_at' => DateTime::now(),
            'bachelor_university' => $university, 'proposed_second_examiners' => $examiners,
        ]);
        $defenses->saveOrFail($defense);
        $saved = $defenses->get($defense->id);
        $this->assertSame($universityEnabled ? $university : null, $saved->bachelor_university);
        $this->assertSame($universityEnabled ? 'Matematica' : null, $saved->bachelor_degree);
        $this->assertSame($examinersEnabled ? $examiners : null, $saved->proposed_second_examiners);
    }
    public function testEnrollmentYearIsRequiredForNewApplications(): void
    {
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        foreach ([[], ['enrollment_year' => null], ['enrollment_year' => ''], ['enrollment_year' => 'abc'], ['enrollment_year' => 2020.5], ['enrollment_year' => 1899], ['enrollment_year' => (int)date('Y') + 1]] as $data) {
            $this->assertNotEmpty($defenses->newEntity($data)->getError('enrollment_year'));
        }
        $this->assertEmpty($defenses->newEntity(['enrollment_year' => 2020])->getError('enrollment_year'));
    }

    public function testBothBachelorFieldsAreRequiredWhenEnabled(): void
    {
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $session = $sessions->newEntity([
            'type' => 'master', 'name' => 'Sessione', 'start_date' => '2027-01-01',
            'ask_bachelor_university' => true,
        ]);
        $sessions->saveOrFail($session);
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        foreach (['bachelor_degree', 'bachelor_university'] as $field) {
            $data = [
                'degree_session_id' => $session->id, 'user_id' => 1,
                'title' => 'Tesi', 'state' => 'submitted', 'submitted_at' => DateTime::now(),
                'enrollment_year' => 2020, 'bachelor_degree' => 'Matematica',
                'bachelor_university' => 'Università di Pisa',
            ];
            $data[$field] = '   ';
            $defense = $defenses->newEntity($data);
            $this->assertFalse($defenses->save($defense));
            $this->assertNotEmpty($defense->getError($field));
        }
    }
}
