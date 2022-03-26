<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use App\Controller\Api\v1\RestController;

class FormsController extends RestController {

    private static $associations = [ 'Users', 'FormTemplates' ];
    public $allowedFilters = [ 'user_id' ];

    public function index() {
        $forms = $this->Forms->find('all', 
            [ 'contain' => FormsController::$associations ]);

        $forms = $this->applyFilters($forms);

        // Check permissions
        if (!$this->user['admin'] && $this->user['id'] != $this->request->getQuery('user_id')) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($forms));
    }

    public function get($id) {
        try {
            $form = $this->Forms->get($id, [ 'contain' => FormsController::$associations ]);
            $form['data'] = json_decode($form['data']);
        }
        catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }

        if (! $this->user->canViewForm($form)) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $form);
    }

    public function delete($id) {
        $form = $this->Forms->get($id);

        if (! $this->user->canDeleteForm($form)) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'The current user can not delete this form.');
            return;
        }

        try {
            $this->Forms->deleteOrFail($form);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::Error, null, 'Error while deleting the proposal');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok);
    }

}

?>