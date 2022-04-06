<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use App\Controller\Api\v1\RestController;

class FormsController extends RestController {

    private static $associations = [ 'Users', 'FormTemplates' ];

    // TODO: decidere come specificare i filtri per i campi associati
    public $allowedFilters = [ 
        'user_id' => Integer::class, 
        'state' => ["draft", "submitted", "approved", "rejected"], 
        'user.givenname' => String::class, 
        'form_template.name' => String::class ];

    public function index() {
        $query = $this->request->getQuery();

        $forms = $this->Forms->find('all', 
            [ 'contain' => FormsController::$associations ]);

        $forms = $this->applyFilters($forms);

        // Check permissions
        if (!$this->user['admin'] && $this->user['id'] != $this->request->getQuery('user_id')) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $forms = $this->paginateQuery($forms);

        // clean the resulting data
        foreach($forms as $form) {
            $form['data'] = json_decode($form['data']);
            unset($form['user']['password']);
            unset($form['form_template']['text']);
            unset($form['form_template']['code']);
        }

        $this->JSONResponse(ResponseCode::Ok, $forms);
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

    public function patch($id) {
        $form = $this->Forms->get($id, [ 'contain' => FormsController::$associations ]); // TODO: catch exception
        $payload = json_decode($this->request->getBody());

        if (!$form || !($this->user['admin'] || $this->user['id'] == $form['user_id'])) {
            // don't leak information:
            // if the form does not exist give the same error as if you cannot access it
            $this->JSONResponse(ResponseCode::Error, null, 'The current user can not edit this form or form does not exist.');
        }

        foreach($payload as $field => $value) {
            if ($field == "state") {
                // Solo il proprietario e l'amministratore possono modifica
                if ($this->user['admin'] || $form['state'] == "draft") {
                    $form[$field] = $value;
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot change a submitted form');
                    return;
                }
            } else if ($field == "data") {
                if ($form['state'] == "draft") {
                    $form[$field] = $value;
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot modify the data of a submitted form');
                    return;
                }
            }
        }
        $this->Forms->save($form);
        $this->JSONResponse(ResponseCode::Ok, $form);
    }

}

?>