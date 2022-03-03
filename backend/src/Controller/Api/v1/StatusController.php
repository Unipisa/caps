<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class StatusController extends AppController
{
    function index() {
        /* We only expose the settings that are safe to view from the client-side */
        $settings = $this->getSettings();
        $safe_settings = [ 
            'user-instructions' => $settings['user-instructions'], 
            'cds' => $settings['cds'], 
            'disclaimer' => $settings['disclaimer'],
            'department' => $settings['department'], 
            'approval-signature-text' => $settings['approval-signature-text']
        ];

        $this->set('settings', $safe_settings);
        $this->viewBuilder()->setOption('serialize', [ 'user', 'settings' ]);
    }
}