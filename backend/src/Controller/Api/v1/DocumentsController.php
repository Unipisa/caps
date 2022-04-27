<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use App\Model\Entity\Document;

class DocumentsController extends RestController {

    public static $associations = [ 'Users' ];
    public $allowedFilters = [ 'user_id' => Integer::class ];

    public function index() {
        $d = $this->Documents->find('all', 
            [ 'contain' => DocumentsController::$associations ]
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

        $d = new Document();

        $data = json_decode($this->request->getBody());

        $d['filename'] = $data->filename;
        $d['mimetype'] = $data->mimetype;
        $d['data'] = base64_decode($data->data);
        $d['owner_id'] = $this->user['id'];
        $d['user_id'] = $data->user_id;
        $d['comment'] = $data->comment;
        $d['user'] = $this->Documents->Users->get($data->user_id);

        if (! $this->Documents->save($d)) {
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

        $d = $this->Documents->get($id);
        if (! $this->Documents->delete($d)) {
            $this->JSONResponse(ResponseCode::Error, [], 'Error deleting the document with id = ' . $id);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, [], 'L\'allegato è stato cancellato.');
    }

}