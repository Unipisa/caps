<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;

class DegreesController extends RestController {

    public static $associations = [];
    public $allowedFilters = [ 'enabled' => Boolean::class ];

    public function index() {
        $c = $this->Degrees->find('all', [
            'contains' => DegreesController::$associations
        ]);

        $c = $this->applyFilters($c);

        $this->JSONResponse(ResponseCode::Ok, $c);
    }

    public function get($id) {
        try {
            $c = $this->Degrees->get($id, [
                'contain' => DegreesController::$associations
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