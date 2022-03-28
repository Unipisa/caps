<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;

class CurriculaController extends RestController {

    public static $associations = [ 'Degrees', 'CompulsoryExams', 
        'FreeChoiceExams', 'CompulsoryGroups', 'CompulsoryExams.Exams', 
        'CompulsoryGroups.Groups' ];
    public $allowedFilters = [ 'degree_id' ];

    public function index() {
        $c = $this->Curricula->find('all', [
            'contains' => CurriculaController::$associations
        ]);

        $c = $this->applyFilters($c);
        $c = $this->paginateQuery($c);

        $this->JSONResponse(ResponseCode::Ok, $c);
    }

    public function get($id) {
        try {
            $c = $this->Curricula->get($id, [
                'contain' => CurriculaController::$associations
            ]);
        }
        catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $c);
    }



}

?>