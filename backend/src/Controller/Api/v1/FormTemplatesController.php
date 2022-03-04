<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;

class FormTemplatesController extends RestController {

    public function index() {
        $form_templates = $this->FormTemplates->find();

        $enabled = $this->request->getQuery('enabled');
        
        if ($enabled !== null) {
            if (! in_array($enabled, [ 'false', 'true' ])) {
                $this->JSONResponse(ResponseCode::Error, null, 'Invalid value for the parameter "enabled"');
                return;
            }
            $enabled = $enabled == 'true';
        }
        else {
            $enabled = true;
        }

        // Non-admin users can not see disabled form templates
        if ($enabled !== true && !$this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;   
        }

        $form_templates = $form_templates->where([ 'enabled' => $enabled ]);
        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($form_templates));
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