<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use App\Controller\Api\v1\RestController;

class FormsController extends RestController {

    private static $associations = [ 'Users', 'FormTemplates' ];

    public function index() {
        $forms = $this->Forms->find('all', 
            [ 'contain' => FormsController::$associations ]);

        $user_id = $this->request->getQuery('user_id');
        $user_id && ($forms = $forms->where([ 'user_id' => $user_id ]));

        // Check permissions
        if (!$this->user['admin'] && $this->user['id'] != $user_id) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($forms));
    }

    public function get($id) {
        try {
            $form = $this->Forms->get($id, [ 'contain' => FormsController::$associations ]);
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