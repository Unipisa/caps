<?php

namespace App\Controller\Api\V1;

use App\Controller\AppController;

class ProposalsController extends AppController
{
    private function get_proposal($id) : ?\App\Model\Entity\Proposal {
        return $this->Proposals->get($id, [ 'contain' => [ 
            'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula', 'ChosenExams.Exams',
            'ChosenExams.Exams.Tags', 'Attachments', 'Attachments.Users', 'ChosenExams.CompulsoryExams',
            'ChosenExams.CompulsoryGroups', 'ChosenExams.FreeChoiceExams',
            'ChosenExams.CompulsoryGroups.Groups', 'Curricula.Degrees', 'ProposalAuths', 
            'Attachments.Proposals', 'Attachments.Proposals.ProposalAuths' ]
        ]);
    }

    function get($id) {
        $p = $this->get_proposal($id);

        if (! $this->user->canViewProposal($p, $this->getSecrets())) { 
            throw new ForbiddenException('Access not allowed to this proposal');
        }

        $this->set('proposal', $p);
        $this->viewBuilder()->setOption('serialize', [ 'proposal' ]);
    }

    function delete($id) {
        // We only get the proposal without all the associated tables, 
        // as we do not need that much data to decide whether the proposal
        // can be deleted or not.
        $p = $this->Proposals->get($id, [ 'contain' => [ 'Users' ] ]);

        if (! $this->user->canDeleteProposal($p)) {
            throw new ForbiddenException('The deletion of this proposal is forbidden to the current user.');
        }

        $this->Proposals->deleteOrFail($p);
        
        $response = [ 
            'message' => 'The proposal has been successfully deleted.',
            'code' => 200
        ];

        $this->set('response', $response);
        $this->viewBuilder()->setOption('serialize', 'response');
    }
}

?>