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

        $d = $this->applyFilters($d);

        if (!$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $d);
    }

    public function post() {
        if (! $this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $d = new FormAttachment();

        $data = json_decode($this->request->getBody());

        $d['filename'] = $data->filename;
        $d['mimetype'] = $data->mimetype;
        $d['data'] = base64_decode($data->data);
        $d['user_id'] = $this->user['id'];
        $d['user'] = $this->FormAttachments->Users->get($data->user_id);
        $d['form_id'] = $data->form_id;
        $d['comment'] = $data->comment;

        if (! $this->FormAttachments->save($d)) {
            $this->JSONResponse(ResponseCode::Error, null, "Error while saving the document.");
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $d);
    }

    public function delete($id) {
        if (! $this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $d = $this->FormAttachments->get($id);
        if (! $this->FormAttachments->delete($d)) {
            $this->JSONResponse(ResponseCode::Error, [], 'Error deleting the document with id = ' . $id);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, [], 'L\'allegato è stato cancellato.');
    }

}