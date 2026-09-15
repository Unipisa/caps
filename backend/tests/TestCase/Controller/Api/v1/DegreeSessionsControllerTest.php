<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller\Api\v1;

use App\Test\TestCase\Controller\MyIntegrationTestCase;
use Cake\I18n\DateTime;
use Cake\ORM\TableRegistry;

class DegreeSessionsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = [
        'app.Degrees',
        'app.DegreeSessions',
        'app.ThesisDefenses',
        'app.Users',
        'app.Settings',
    ];

    /**
     * The public schedule groups assigned defenses and respects publication consent.
     *
     * @return void
     */
    public function testScheduleIsPublicAndReturnsFutureSchedule(): void
    {
        $timezone = new \DateTimeZone('Europe/Rome');
        $day = (new \DateTimeImmutable('tomorrow', $timezone))->format('Y-m-d');
        $utc = new \DateTimeZone('UTC');

        $sessions = TableRegistry::getTableLocator()->get('DegreeSessions');
        $session = $sessions->newEntity([
            'degree_id' => 1,
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
                    ['time' => '8:30', 'name' => 'Mario Rossi', 'type' => 'LT'],
                    ['html' => '&dash;'],
                    ['time' => '10:00', 'name' => '24681', 'type' => 'LT'],
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
