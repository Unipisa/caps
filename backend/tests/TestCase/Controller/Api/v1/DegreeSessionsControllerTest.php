<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller\Api\v1;

use App\Test\TestCase\Controller\MyIntegrationTestCase;
use Cake\I18n\DateTime;
use Cake\ORM\TableRegistry;
use PHPUnit\Framework\Attributes\DataProvider;

class DegreeSessionsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = [
        'app.DegreeSessions',
        'app.ThesisDefenses',
        'app.Users',
        'app.Settings',
    ];

    public static function sessionTypes(): array
    {
        return [['bachelor', 'LT'], ['master', 'LM']];
    }

    public function testTypeIsRequiredAndRestricted(): void
    {
        $sessions = TableRegistry::getTableLocator()->get('DegreeSessions');
        $data = ['name' => 'Sessione', 'start_date' => '2027-01-01'];
        foreach ([[], ['type' => ''], ['type' => null], ['type' => 'doctorate']] as $invalid) {
            $session = $sessions->newEntity($invalid + $data);
            $this->assertNotEmpty($session->getError('type'));
            $this->assertFalse($sessions->save($session));
        }
    }

    public function testIndexFiltersByTypeAndGetReturnsTypeWithoutDegree(): void
    {
        $sessions = TableRegistry::getTableLocator()->get('DegreeSessions');
        foreach (['bachelor', 'master'] as $type) {
            $session = $sessions->newEntity([
                'type' => $type, 'name' => 'Sessione', 'start_date' => '2027-01-01',
            ]);
            $sessions->saveOrFail($session);
        }
        $this->studentSession();
        $this->get('/api/v1/degree_sessions?type=master');
        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true)['data'];
        $this->assertCount(1, $data);
        $this->assertSame('master', $data[0]['type']);
        $this->assertArrayNotHasKey('degree_id', $data[0]);
        $this->assertArrayNotHasKey('degree', $data[0]);

        $this->get('/api/v1/degree_sessions/' . $session->id);
        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true)['data'];
        $this->assertSame('master', $data['type']);
        $this->assertArrayNotHasKey('degree_id', $data);
    }

    /**
     * The public schedule groups assigned defenses and respects publication consent.
     *
     * @return void
     */
    #[DataProvider('sessionTypes')]
    public function testScheduleIsPublicAndReturnsFutureSchedule(string $type, string $scheduleType): void
    {
        $timezone = new \DateTimeZone('Europe/Rome');
        $day = (new \DateTimeImmutable('tomorrow', $timezone))->format('Y-m-d');
        $utc = new \DateTimeZone('UTC');

        $sessions = TableRegistry::getTableLocator()->get('DegreeSessions');
        $session = $sessions->newEntity([
            'type' => $type,
            'name' => 'Prossima sessione',
            'start_date' => $day,
        ]);
        $sessions->saveOrFail($session);

        $defenses = TableRegistry::getTableLocator()->get('ThesisDefenses');
        $scheduledDefenses = [
            [
                'user_id' => 1,
                'public' => true,
                'scheduled_at' => new DateTime($day . ' 08:30', $timezone),
            ],
            [
                'user_id' => 3,
                'public' => false,
                'scheduled_at' => new DateTime($day . ' 10:00', $timezone),
            ],
        ];
        foreach ($scheduledDefenses as $data) {
            $defense = $defenses->newEntity($data + [
                'degree_session_id' => $session->id,
                'title' => 'Titolo',
                'state' => 'approved',
                'venue' => 'Aula Magna',
                'submitted_at' => new DateTime('now', $utc),
            ]);
            $defenses->saveOrFail($defense);
        }

        $this->get('/api/v1/degree_sessions/schedule/' . $day);

        $this->assertResponseOk();
        $response = json_decode((string)$this->_response->getBody(), true);
        $this->assertSame([
            [
                'room' => 'Aula Magna',
                'events' => [
                    ['time' => '8:30', 'name' => 'Mario Rossi', 'type' => $scheduleType],
                    ['html' => '&dash;'],
                    ['time' => '10:00', 'name' => '24681', 'type' => $scheduleType],
                ],
            ],
        ], $response['data']);
    }

    /**
     * @return void
     */
    public function testScheduleReturnsAnEmptyScheduleWhenThereIsNoSession(): void
    {
        $timezone = new \DateTimeZone('Europe/Rome');
        $day = (new \DateTimeImmutable('tomorrow', $timezone))->format('Y-m-d');

        $this->get('/api/v1/degree_sessions/schedule/' . $day);

        $this->assertResponseOk();
        $response = json_decode((string)$this->_response->getBody(), true);
        $this->assertSame([], $response['data']);
    }

    /**
     * @return void
     */
    public function testScheduleRejectsInvalidDateFormat(): void
    {
        $this->get('/api/v1/degree_sessions/schedule/12-09-2026');

        $this->assertResponseCode(400);
        $response = json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Invalid day: expected YYYY-MM-DD', $response['message']);
    }

    /**
     * @return void
     */
    public function testScheduleRejectsToday(): void
    {
        $timezone = new \DateTimeZone('Europe/Rome');
        $today = (new \DateTimeImmutable('today', $timezone))->format('Y-m-d');

        $this->get('/api/v1/degree_sessions/schedule/' . $today);

        $this->assertResponseCode(400);
        $response = json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('The schedule date must be in the future', $response['message']);
    }
}
