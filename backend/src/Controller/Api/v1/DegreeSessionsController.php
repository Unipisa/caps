<?php
namespace App\Controller\Api\v1;

class DegreeSessionsController extends RestController
{
    /**
     * Set the table name to degree_sessions (snake_case)
     * to match the actual database table name.
     */
    public function initialize(): void
    {
        parent::initialize();
        $this->loadModel('DegreeSessions');
    }

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
