<?php
namespace App\Controller\Api\v1;

use Cake\Event\EventInterface;

class DegreeSessionsController extends RestController
{
    public static $associations = [
        'Degrees',
    ];

    public $allowedFilters = [
        'degree.name' => [
            'type' => String::class,
            'dbfield' => 'Degrees.name',
            'modifier' => 'LIKE',
        ],
        'start_date' => [
            'type' => Integer::class,
            'dbfield' => 'DegreeSessions.start_date',
        ],
    ];

    public function beforeFilter(EventInterface $event)
    {
        parent::beforeFilter($event);
        $this->Authentication->allowUnauthenticated(['today']);
    }

    /**
     * Return the public schedule for degree sessions taking place today.
     */
    public function today(): void
    {
        $timezone = new \DateTimeZone($this->Caps['timezone']);
        $today = (new \DateTimeImmutable('now', $timezone))->format('Y-m-d');

        $sessions = $this->DegreeSessions->find()
            ->contain([
                'Degrees',
                'ThesisDefenses' => function ($query) {
                    return $query
                        ->contain(['Users'])
                        ->where([
                            'ThesisDefenses.state' => 'approved',
                            'ThesisDefenses.scheduled_at IS NOT' => null,
                            'ThesisDefenses.venue IS NOT' => null,
                        ]);
                },
            ])
            ->where(['DegreeSessions.start_date' => $today]);

        $rooms = [];
        foreach ($sessions as $session) {
            $type = (int)$session->degree->years === 3 ? 'LT' : 'LM';

            foreach ($session->thesis_defenses as $defense) {
                $scheduledAt = (clone $defense->scheduled_at)->setTimezone($timezone);
                if ($scheduledAt->format('Y-m-d') !== $today) {
                    continue;
                }

                $room = trim($defense->venue);
                if ($room === '') {
                    continue;
                }

                if (!isset($rooms[$room])) {
                    $rooms[$room] = [
                        'room' => $room,
                        // Floors are not currently stored separately from venues.
                        'floor' => null,
                        'events' => [],
                    ];
                }

                $name = $defense->public ? trim((string)$defense->user->name) : '';
                if ($name === '') {
                    $name = (string)$defense->user->number;
                }

                $rooms[$room]['events'][] = [
                    'time' => $scheduledAt->format('G:i'),
                    'name' => $name,
                    'type' => $type,
                    '_timestamp' => $scheduledAt->getTimestamp(),
                ];
            }
        }

        ksort($rooms, SORT_NATURAL | SORT_FLAG_CASE);
        foreach ($rooms as &$room) {
            usort($room['events'], fn($a, $b) => $a['_timestamp'] <=> $b['_timestamp']);

            $events = [];
            $previousTimestamp = null;
            foreach ($room['events'] as $event) {
                $timestamp = $event['_timestamp'];
                unset($event['_timestamp']);

                // A long gap denotes a break in the displayed timetable.
                if ($previousTimestamp !== null && $timestamp - $previousTimestamp >= 3600) {
                    $events[] = ['html' => '&dash;'];
                }

                $events[] = $event;
                $previousTimestamp = $timestamp;
            }
            $room['events'] = $events;
        }
        unset($room);

        $this->JSONResponse(ResponseCode::Ok, array_values($rooms));
    }

    public function index()
    {
        $query = $this->DegreeSessions->find()->contain([
            'Degrees' => function ($query) {
                return $query
                    ->enableAutoFields(true)
                    ->select(['Degrees.thesis_session_notes']);
            },
        ]);
        $query = $this->applyFilters($query);

        $this->JSONResponse(ResponseCode::Ok, $query);
    }

    public function get($id)
    {
        try {
            $session = $this->DegreeSessions->get($id, ['contain' => [
                'Degrees' => function ($query) {
                    return $query
                        ->enableAutoFields(true)
                        ->select(['Degrees.thesis_session_notes']);
                },
            ]]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'DegreeSession not found');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $session);
    }
}
