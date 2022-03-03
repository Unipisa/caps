<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class UsersController extends AppController
{
    function get($id = null) {
        $id = ($id == null) ? $this->user['id'] : $id;

        if ($id != $this->user['id'] && ! $this->user['admin']) {
            throw new ForbiddenException('Cannot access another user profile');
        }

        $user_entry = $this->Users->get($id, 
            ['contain' => ['Documents', 'Documents.Users', 'Documents.Owners']]
        );
        
        $this->set('user', $user_entry);
        $this->viewBuilder()->setOption('serialize', [ 'user' ]);
    }
}