<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class GroupsController extends RestController {

    public static $associations = [ 'Exams' ];
    public $allowedFilters = [ 'degree_id' => Integer::class ];

    public function index() {
        $groups = $this->Groups->find('all', [ 'contain' => GroupsController::$associations ]);
        $groups = $this->applyFilters($groups);
        $this->JSONResponse(ResponseCode::Ok, $groups);
    }

    public function get($id) {
        $group = $this->Groups->get($id, [ 'contain' => GroupsController::$associations ]);
        $this->JSONResponse(ResponseCode::Ok, $group);
    }

}