<?php
namespace App\Controller\Api\v1;

class ThesisDefensesController extends RestController
{
    public $allowedFilters = [
        'user_id' => Integer::class,
        'state' => ['type' => String::class, 'options' => ['submitted', 'approved', 'rejected']],
        'submitted_at' => Integer::class,
    ];

    public function index()
    {
        if (!$this->user['admin'] && (int)$this->request->getQuery('user_id') !== (int)$this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }
        $query = $this->ThesisDefenses->find()->contain([
            'DegreeSessions', 'DegreeSessions.Degrees', 'ThesisDefenseAdvisors',
        ]);
        $query = $this->applyFilters($query);
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
