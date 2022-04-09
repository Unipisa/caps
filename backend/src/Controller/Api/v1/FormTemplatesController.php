<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class FormTemplatesController extends RestController {

    public $allowedFilters = [ 'enabled' => Boolean::class ];

    public function index() {
        $form_templates = $this->FormTemplates->find();
        $form_templates = $this->applyFilters($form_templates);

        // Non-admin users can not see disabled form templates
        if ($this->request->getQuery('enabled') !== 'true' && !$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;   
        }

        $this->JSONResponse(ResponseCode::Ok, $form_templates);
    }

    public function get($id) {
        try {
            $form_template = $this->FormTemplates->get($id);
        }
        catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }

        if (!$form_template['enabled'] && !$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $form_template);
    }

}

?>