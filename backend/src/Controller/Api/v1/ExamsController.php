<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class ExamsController extends RestController {

    public static $associations = [];

    public function index() {
        $exams = $this->Exams->find('all', ['contains' => ExamsController::$associations ]);
        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($exams));
    }

}