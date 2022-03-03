<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class StatusController extends AppController
{
    function index() {
        $this->viewBuilder()->setOption('serialize', [ 'user', 'settings' ]);
    }
}