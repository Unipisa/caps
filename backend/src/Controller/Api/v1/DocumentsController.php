<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

use const App\Controller\Api\v1\COMMON_FIELDS as V1COMMON_FIELDS;

const COMMON_FIELDS = [
    "id",
    "filename",
    "user_id",
    "proposal_id",
    "mimetype",
    "comment",
    "created"];

class DocumentsController extends RestController {

    protected $associations = [ 'Users' ];
    public $allowedFilters = [ 'user_id' ];
    protected $indexFields = COMMON_FIELDS;
    protected $getFields = [...COMMON_FIELDS, ...["data"]];

    protected function permissionFilter($query) {
        if (!$this->user['admin']) {
            $query = $query->where(["user_id" => $this->user['id']]);
        }
        return $query;
    }
}