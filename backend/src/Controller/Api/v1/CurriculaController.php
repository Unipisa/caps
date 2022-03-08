<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;

use const App\Controller\Api\v1\COMMON_FIELDS as V1COMMON_FIELDS;

const COMMON_FIELDS = [
    "id",
    "name",
    "degree_id",
    "notes",
    "credits_per_year",
    "credits" ];

class CurriculaController extends RestController {
    protected $tableName = 'Curricula';
    protected $typeName = 'curriculum';
    protected $getFields = COMMON_FIELDS;
    protected $listFields = COMMON_FIELDS;
    protected $associations = [ 'Degrees', 'CompulsoryExams', 
        'FreeChoiceExams', 'CompulsoryGroups', 'CompulsoryExams.Exams', 
        'CompulsoryGroups.Groups' ];
    public $allowedFilters = [ 'degree_id' ];
}

?>