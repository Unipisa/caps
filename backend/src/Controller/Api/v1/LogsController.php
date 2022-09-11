<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use App\Controller\Api\v1\RestController;

class LogsController extends RestController {

    private static $associations = [ 'Users' ];

    // TODO: decidere come specificare i filtri per i campi associati
    public $allowedFilters = [
        'timestamp' => Integer::class,
        'proposal_id' => Integer::class, 
        'user_id' => Integer::class
        ];

    public function index() {
        $query = $this->request->getQuery();

        $logs = $this->Logs->find('all', 
            [ 'contain' => LogsController::$associations ]);

        $logs = $this->applyFilters($logs);

        // Check permissions
        if (!$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $logs);
    }
}

?>