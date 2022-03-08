<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use Cake\ORM\TableRegistry;

const COMMON_FIELDS = [ 
    "id",
    "state",
    "date_submitted",
    "date_managed",
    "FormTemplates.id",
    "FormTemplates.name",
    "FormTemplates.enabled",
    "Users.id",
    "Users.username",
    "Users.name",
    "Users.number",
    "Users.givenname",
    "Users.surname",
    "Users.email",
    "Users.admin"];

class FormsController extends RestController {

    protected $tableName = "Forms";
    protected $typeName = "form";
    protected $associations = [ 'Users', 'FormTemplates' ];
    public $allowedFilters = [ 'user_id', 'state' ]; 
    protected $indexFields = COMMON_FIELDS;
    protected $getFields = [...COMMON_FIELDS, ...["data"]];

    public function permissionFilter($query) {
        if (!$this->user['admin']) {
            // only shows owned forms
            $query = $query->where(['user_id' => $this->user['id']]);
        }
        return $query;
    }

    // override to explode "data" json field
    protected function getItem($id) {
        $item = parent::getItem($id);

        if ($item !== null) {
            // explode json data in 'data' field
            $item['data'] = json_decode($item['data']);
        }

        return $item;
    }

}

?>