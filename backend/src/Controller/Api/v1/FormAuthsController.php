<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use App\Model\Entity\FormAuth;

class FormAuthsController extends RestController {
    public static $associations = [ 'Forms' ];
    public $allowedFilters = [ 'user_id' => Integer::class, 'form_id' => Integer::class];

    public function index() {
        $d = $this->FormAuths->find('all', 
            [ 'contain' => FormAuthsController::$associations ]
        );

        $d = $this->applyFilters($d);

        if (!$this->user['admin']) {
            $d = $d->where(['user_id' => $this->user['id']]);
        }

        foreach($d as $x) {
            unset($x['secret']);
        }

        $this->JSONResponse(ResponseCode::Ok, $d);
    }
}