<?php
namespace App\Controller\Api\v1;

class ThesisDefensesController extends RestController
{
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
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }
        if (!$this->user['admin'] && $defense->user_id !== $this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }
        foreach ($defense->thesis_defense_attachments as $attachment) {
            unset($attachment->data);
        }
        $this->JSONResponse(ResponseCode::Ok, $defense);
    }
}
