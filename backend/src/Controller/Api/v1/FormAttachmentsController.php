<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use App\Model\Entity\FormAttachment;

class FormAttachmentsController extends RestController {

    public static $associations = [ 'Forms', 'Users' ];
    public $allowedFilters = [ 'form_id' => Integer::class ];

    public function index() {
        $d = $this->FormAttachments->find('all', 
            [ 'contain' => FormAttachmentsController::$associations ]
        );

        // If the user is not the admin, then we restrict the view to forms 
        // which he/she has control over
        if (! $this->user['admin']) {
            $d = $d->where([ 'Forms.user_id' => $this->user->id ]);
        }

        $d = $this->applyFilters($d);

        $this->JSONResponse(ResponseCode::Ok, $d);
    }

    public function post() {
        $d = new FormAttachment();
        $body = $this->request->getBody();
        $data = json_decode($body);

        if (! $this->user['admin']) {
            // We need to check if the user can submit an attachment for this form,
            // which is only possible if he/she is the author of the given form.
            $form = $this->FormAttachments->Forms->get($data->form_id, [
                'contain' => 'Users'
            ]);

            if ($form['user']['username'] != $this->user->username) {
                $this->JSONResponse(ResponseCode::Forbidden);
                return;
            }
        }

        $d['filename'] = $data->filename;
        $d['mimetype'] = $data->mimetype;
        $d['data'] = base64_decode($data->data);
        $d['user_id'] = $this->user['id'];
        $d['user'] = $this->FormAttachments->Users->get($this->user['id']);
        $d['form_id'] = $data->form_id;
        $d['comment'] = $data->comment;

        if (! $this->FormAttachments->save($d)) {
            $this->JSONResponse(ResponseCode::Error, null, "Error while saving the document.");
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $d);
    }

    public function delete($id) {
        $d = $this->FormAttachments->get($id, [ 'contain' => 'Users' ]);

        if (!$this->user['admin'] && $d['user']['username'] != $this->user->username) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        if (! $this->FormAttachments->delete($d)) {
            $this->JSONResponse(ResponseCode::Error, [], 'Error deleting the document with id = ' . $id);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, [], 'L\'allegato è stato cancellato.');
    }

}