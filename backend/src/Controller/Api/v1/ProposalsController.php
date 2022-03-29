<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;
use App\Model\Entity\Proposal;

class ProposalsController extends RestController
{
    public static $associations = [ 
        'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula', 'ChosenExams.Exams',
        'ChosenExams.Exams.Tags', 'Attachments', 'Attachments.Users', 'ChosenExams.CompulsoryExams',
        'ChosenExams.CompulsoryGroups', 'ChosenExams.FreeChoiceExams',
        'ChosenExams.CompulsoryGroups.Groups', 'Curricula.Degrees',
        'Attachments.Proposals', 'Attachments.Proposals.ProposalAuths' ];

    public $allowedFilters = [ 'user_id' ];

    function index() {
        $proposals = $this->Proposals->find()
            ->contain(ProposalsController::$associations);
        $proposals = $this->applyFilters($proposals);

        // Check permissions: users can see their proposals, and admins are 
        // always allowed to perform any query they like.
        if (!$this->user['admin'] && $this->user['id'] != $this->request->getQuery('user_id')) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($proposals));
    }

    public function get($id) {
        try {
            $p = $this->Proposals->get($id, [ 'contain' => ProposalsController::$associations ]);
        }
        catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, "Proposal not found");
            return;
        }

        if (! $this->user->canViewProposal($p, $this->getSecrets())) {
            $this->JSONResponse(ResponseCode::Forbidden, null, "Access not allowed to this proposal");
        }
        else {
            $this->JSONResponse(ResponseCode::Ok, $p);
        }       
    }

    function delete($id) {
        // We only get the proposal without all the associated tables, 
        // as we do not need that much data to decide wheather the proposal
        // can be deleted or not.
        $p = $this->Proposals->get($id, [ 'contain' => [ 'Users' ] ]);

        if (! $this->user->canDeleteProposal($p)) {
            $this->JSONResponse(ResponseCode::Forbidden, [], 'The deletion of this proposal is forbidden to the current user.');
            return;
        }

        try {
            $this->Proposals->deleteOrFail($p);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::Error, [], 'A database error was encountered while saving the proposal');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, [], 'The proposal has been successfully deleted.');
    }
}

?>