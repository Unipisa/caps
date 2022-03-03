<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class FormsController extends AppController {

    public function delete($id) {
        $form = $this->Forms->get($id);

        if (! $this->user->canDeleteForm($form)) {
            throw new ForbiddenException('The current user can not delete this form.');
        }

        $this->Forms->deleteOrFail($form);

        $this->set('response', [ 
            'message' => 'Il modulo è stato eliminato.', 
            'code' => 200
        ]);

        $this->viewBuilder()->setOption('serialize', 'response');
    }

}

?>