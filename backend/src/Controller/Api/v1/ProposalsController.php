<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class ProposalsController extends AppController
{
    function delete($id) {
        $p = $this->Proposals->get($id);

        if (! $this->user->canDeleteProposal($p)) {
            $response = [ 
                'message'=> 'The deletion of this proposal is forbidden to the current user.', 
                'code' => 503
            ];
        }
        else {
            if (! $this->Proposals->delete($p)) {
                $response = [ 
                    'message' => 'A database error was encountered while deleting the proposal.', 
                    'code' => 500
                ];
            }
            else {
                $response = [ 
                    'message' => 'The proposal has been successfully deleted.',
                    'code' => 200
                ];
            }
        }

        $this->set('response', $response);
        $this->viewBuilder()->setOption('serialize', 'response');
    }
}

?>