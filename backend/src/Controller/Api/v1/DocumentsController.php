<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class DocumentsController extends RestController {

    public static $associations = [ 'Users' ];

    public function index() {
        $d = $this->Documents->find('all', 
            [ 'contain' => DocumentsController::$associations ]
        );

        $user_id = $this->request->getQuery('user_id');
        $user_id && ($d = $d->where([ 'user_id' => $user_id ]));

        if (!$this->user['admin'] && $this->user['id'] != $user_id) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($d));
    }

}