<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use App\Controller\Api\v1\RestController;

class UsersController extends RestController
{
    function get($id = null) {
        $id = ($id == null) ? $this->user['id'] : $id;

        if ($id != $this->user['id'] && ! $this->user['admin']) {
            $this->JSONResponse(ResponseCode::Forbidden, [], 'Cannot access another user profile');
            return;
        }

        $user_entry = $this->Users->get($id, 
            ['contain' => ['Documents', 'Documents.Users', 'Documents.Owners']]
        );

        $this->JSONResponse(ResponseCode::Ok, $user_entry);
    }
}