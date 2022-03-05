<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class DocumentsController extends RestController {

    public static $associations = [ 'Users' ];
    public $allowedFilters = [ 'user_id' ];

    public function index() {
        $d = $this->Documents->find('all', 
            [ 'contain' => DocumentsController::$associations ]
        );

        $d = $this->applyFilters($d);

        if (!$this->user['admin'] && $this->user['id'] !== $this->request->getQuery($user_id)) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($d));
    }

}