<?php
namespace App\Controller\Api\v1;

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

    /**
     * Configure the public schedule before authentication is checked.
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();
        $this->Authentication->allowUnauthenticated(['schedule']);
    }

    /**
     * Return the public schedule for degree sessions taking place on a future day.
     *
     * @param string $day Schedule date in YYYY-MM-DD format.
     * @return void
     */
    public function schedule(string $day): void
    {
        $timezone = new \DateTimeZone($this->Caps['timezone']);
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $day, $timezone);
        if ($date === false || $date->format('Y-m-d') !== $day) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'Invalid day: expected YYYY-MM-DD');
            return;
        }

        $today = new \DateTimeImmutable('today', $timezone);
        if ($date <= $today) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'The schedule date must be in the future');
            return;
        }

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
            ->where(['DegreeSessions.start_date' => $day]);

        $rooms = [];
        foreach ($sessions as $session) {
            $type = (int)$session->degree->years === 3 ? 'LT' : 'LM';

            foreach ($session->thesis_defenses as $defense) {
                $scheduledAt = (clone $defense->scheduled_at)->setTimezone($timezone);
                if ($scheduledAt->format('Y-m-d') !== $day) {
                    continue;
                }

                $room = trim($defense->venue);
                if ($room === '') {
                    continue;
                }

                if (!isset($rooms[$room])) {
                    $rooms[$room] = [
                        'room' => $room,
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
                if ($previousTimestamp !== null && $timestamp - $previousTimestamp > 3600) {
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
