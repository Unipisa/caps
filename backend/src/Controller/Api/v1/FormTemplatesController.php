<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class FormTemplatesController extends RestController {

    public function index() {
        $form_templates = $this->FormTemplates->find();
    }

}

?>