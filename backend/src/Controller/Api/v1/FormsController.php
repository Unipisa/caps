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

    public function patch($id, $payload) {
        $form = $this->Forms->get($id); // TODO: catch exception

        if (!$form || !($this->user['admin'] || $this->user.id == $form['user_id'])) {
            // don't leak information:
            // if the form does not exist give the same error as if you cannot access it
            $this->JSONResponse(ResponseCode::Error, null, 'The current user can not edit this form or form does not exist.');
        }

        foreach($payload as $field => $value) {
            if ($field == "state") {
                // Solo il proprietario e l'amministratore possono modifica
                if ($this->user['admin'] || $form.state == "draft") {
                    $form[$field] = $value;
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot change a submitted form');
                }
            } else if ($field == "data") {
                if ($form.state == "draft") {
                    $form[$field] = $value;
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot modify the data of a submitted form');
                }
            }
        }

        if (! $this->user->canEditForm($form)) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'The current user can not delete this form.');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $form);
    }

}

?>