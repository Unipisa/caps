<?php
namespace App\Controller\Api\v1;

use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;
use Cake\ORM\Exception\PersistenceFailedException;

class ThesisDefensesController extends RestController
{
    public static $associations = [
        'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
        'ThesisDefenseAdvisors', 'ThesisDefenseAttachments',
    ];

    public $allowedFilters = [
        'user_id' => Integer::class,
        'state' => ['type' => String::class, 'options' => ['submitted', 'approved', 'rejected']],
        'user.surname' => [
            'type' => String::class,
            'dbfield' => 'Users.surname',
            'modifier' => 'LIKE',
        ],
        'degree_session.degree.name' => [
            'type' => String::class,
            'dbfield' => 'Degrees.name',
            'modifier' => 'LIKE',
        ],
        'degree_session.name' => [
            'type' => String::class,
            'dbfield' => 'DegreeSessions.name',
            'modifier' => 'LIKE',
        ],
        'title' => [
            'type' => String::class,
            'dbfield' => 'ThesisDefenses.title',
            'modifier' => 'LIKE',
        ],
        'scheduled_at' => [
            'type' => Integer::class,
            'dbfield' => 'ThesisDefenses.scheduled_at',
        ],
        'submitted_at' => [
            'type' => Integer::class,
            'dbfield' => 'ThesisDefenses.submitted_at',
        ],
        'modified' => [
            'type' => Integer::class,
            'dbfield' => 'ThesisDefenses.modified',
        ],
    ];

    public function index()
    {
        if (!$this->user['admin'] && (int)$this->request->getQuery('user_id') !== (int)$this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }
        $query = $this->ThesisDefenses->find()->contain([
            'Users', 'DegreeSessions', 'DegreeSessions.Degrees', 'ThesisDefenseAdvisors',
        ]);
        $query = $this->applyFilters($query);

        foreach ($query as $defense) {
            unset($defense['user']['password']);
            unset($defense['user']['username']);
            unset($defense['user']['email']);
            unset($defense['user']['admin']);
        }

        $this->JSONResponse(ResponseCode::Ok, $query);
    }

    public function get($id)
    {
        try {
            $defense = $this->ThesisDefenses->get($id, ['contain' => [
                'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
                'ThesisDefenseAdvisors', 'ThesisDefenseAttachments',
            ]]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'ThesisDefense not found');
            return;
        }
        if (!$this->user['admin'] && $defense->user_id !== $this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Access not allowed to this thesis defense');
            return;
        }
        foreach ($defense->thesis_defense_attachments as $attachment) {
            unset($attachment->data);
        }
        $this->JSONResponse(ResponseCode::Ok, $defense);
    }

    public function post($id = null)
    {
        $path = parse_url($this->getRequest()->getRequestTarget(), PHP_URL_PATH);

        // Handle POST without id (create new thesis defense)
        if ($id === null) {
            return $this->create();
        }

        if (str_ends_with($path, '/approve')) {
            return $this->approve($id);
        } elseif (str_ends_with($path, '/reject')) {
            return $this->reject($id);
        } else {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Bad request');
            return;
        }
    }

    /**
     * Create a new thesis defense submission.
     */
    public function create()
    {
        if (!$this->user) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Authentication required');
            return;
        }

        $body = $this->request->getBody();
        $data = json_decode($body, true);

        if ($data === null) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'Invalid JSON payload');
            return;
        }

        // Validate required fields
        if (empty($data['degree_session_id'])) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'degree_session_id is required');
            return;
        }
        if (empty($data['title'])) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'title is required');
            return;
        }
        if (empty($data['thesis_defense_advisors']) || !is_array($data['thesis_defense_advisors'])) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'At least one advisor is required');
            return;
        }

        // Validate advisors
        $advisors = array_values(array_filter(
            $data['thesis_defense_advisors'],
            fn($advisor) => !empty(trim($advisor['name'] ?? '')) || !empty(trim($advisor['email'] ?? ''))
        ));

        if (count($advisors) === 0) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'At least one valid advisor is required');
            return;
        }

        $defense = $this->ThesisDefenses->newEmptyEntity();
        $defense = $this->ThesisDefenses->patchEntity($defense, [
            'degree_session_id' => $data['degree_session_id'],
            'phone' => $data['phone'] ?? null,
            'title' => $data['title'],
            'proposed_second_examiners' => $data['proposed_second_examiners'] ?? null,
            'public' => !empty($data['public']),
            'user_id' => $this->user['id'],
            'state' => 'submitted',
            'submitted_at' => FrozenTime::now(),
            'thesis_defense_advisors' => $advisors,
        ], ['associated' => ['ThesisDefenseAdvisors']]);

        if ($defense->hasErrors()) {
            $errors = $this->formatErrors($defense->getErrors());
            $this->JSONResponse(ResponseCode::BadRequest, null, $errors);
            return;
        }

        $connection = ConnectionManager::get('default');
        try {
            $connection->transactional(function () use ($defense): void {
                $this->ThesisDefenses->saveOrFail($defense, [
                    'associated' => ['ThesisDefenseAdvisors'],
                ]);
            });
        } catch (PersistenceFailedException $e) {
            $errors = $this->formatErrors($e->getEntity()->getErrors());
            $this->JSONResponse(ResponseCode::BadRequest, null, $errors);
            return;
        } catch (\Exception $e) {
            $this->log($e->getMessage());
            $this->JSONResponse(ResponseCode::Error, null, 'A database error occurred while creating the thesis defense');
            return;
        }

        $created = $this->ThesisDefenses->get($defense->id, ['contain' => [
            'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
            'ThesisDefenseAdvisors',
        ]]);

        $this->JSONResponse(ResponseCode::Ok, $created);
    }

    /**
     * Update a thesis defense (admin only).
     */
    public function patch($id)
    {
        try {
            $defense = $this->ThesisDefenses->get($id, ['contain' => [
                'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
                'ThesisDefenseAdvisors', 'ThesisDefenseAttachments',
            ]]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'ThesisDefense not found');
            return;
        }

        // Only admins can manage thesis defenses
        if (!$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Only administrators can manage thesis defenses');
            return;
        }

        $body = $this->request->getBody();
        $data = json_decode($body, true);

        if ($data === null) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'Invalid JSON payload');
            return;
        }

        $allowed = array_intersect_key($data, array_flip([
            'state', 'scheduled_at', 'venue',
        ]));

        if (!empty($allowed['scheduled_at'])) {
            $allowed['scheduled_at'] = (new FrozenTime($allowed['scheduled_at'], $this->Caps['timezone']))
                ->setTimezone('UTC');
        }

        $allowed['managed_at'] = FrozenTime::now();

        $defense = $this->ThesisDefenses->patchEntity($defense, $allowed);

        if (!$this->ThesisDefenses->save($defense)) {
            $errors = $this->formatErrors($defense->getErrors());
            $this->JSONResponse(ResponseCode::Error, null, $errors);
            return;
        }

        $updated = $this->ThesisDefenses->get($defense->id, ['contain' => [
            'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
            'ThesisDefenseAdvisors', 'ThesisDefenseAttachments',
        ]]);

        $this->JSONResponse(ResponseCode::Ok, $updated);
    }

    /**
     * Approve a thesis defense (admin only).
     */
    private function approve($id)
    {
        try {
            $defense = $this->ThesisDefenses->get($id, ['contain' => ['Users']]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'ThesisDefense not found');
            return;
        }

        if (!$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Only administrators can approve thesis defenses');
            return;
        }

        $defense->state = 'approved';
        $defense->managed_at = FrozenTime::now();

        if (!$this->ThesisDefenses->save($defense)) {
            $this->JSONResponse(ResponseCode::Error, null, 'Failed to approve thesis defense');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $defense);
    }

    /**
     * Reject a thesis defense (admin only).
     */
    private function reject($id)
    {
        try {
            $defense = $this->ThesisDefenses->get($id, ['contain' => ['Users']]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'ThesisDefense not found');
            return;
        }

        if (!$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Only administrators can reject thesis defenses');
            return;
        }

        $defense->state = 'rejected';
        $defense->managed_at = FrozenTime::now();

        if (!$this->ThesisDefenses->save($defense)) {
            $this->JSONResponse(ResponseCode::Error, null, 'Failed to reject thesis defense');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $defense);
    }

    private function formatErrors(array $errors): string
    {
        $messages = [];
        $collect = function ($error) use (&$collect, &$messages): void {
            if (is_string($error)) {
                $messages[] = $error;
                return;
            }

            if (is_array($error)) {
                foreach ($error as $value) {
                    $collect($value);
                }
            }
        };

        $collect($errors);

        return !empty($messages) ? implode('; ', $messages) : 'Validation errors occurred';
    }
}
