<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class GroupsController extends RestController {

    public static $associations = [ 'Exams' ];
    public $allowedFilters = [ 'degree_id' ];

    public function index() {
        $groups = $this->Groups->find('all', [ 'contain' => GroupsController::$associations ]);
        $groups = $this->applyFilters($groups);
        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($groups));
    }

}