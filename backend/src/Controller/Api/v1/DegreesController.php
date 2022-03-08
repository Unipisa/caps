<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;

const COMMON_FIELDS = [
    "id", 
    "name",
    "years",
    "enable_sharing",
    "approval_confirmation",
    "rejection_confirmation",
    "submission_confirmation",
    "academic_year",
    "enabled",
];

class DegreesController extends RestController {
    protected $tableName = "Degrees";
    protected $typeName = "degree";
    protected $indexFields = COMMON_FIELDS;
    protected $getFields = [ ...COMMON_FIELDS, ...[
        "approval_message",
        "rejection_message",
        "submission_message",
        "default_group_id" ]];
    public $allowedFilters = [ 'enabled' ];
}

?>