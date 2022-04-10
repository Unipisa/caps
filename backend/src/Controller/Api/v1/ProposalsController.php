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

    public $allowedFilters = [ 
        'user_id' => Integer::class,
        'state' => ['type' => String::class, 
              'options' => ["draft", "submitted", "approved", "rejected"]],
        'user.surname' => [ 'type' => String::class, 
                'dbfield' => "Users.surname",
                'modifier' => "LIKE" ],
        'curriculum.degree.academic_year' => [ 'type' =>  Integer::class,
                'dbfield' => "Curricula.Degree.academic_year"],
        'curriculum.degree.name' => [ 'type' => String::class,
                'dbfield' => "Curricula.Degree.name",
                'modifier' => "LIKE" ],
        'curriculum.name' => ['type' => String::class,
                'dbfield' => "Curricula.name", "LIKE"],
        'exam.name' => ['type' => String::class,
                'dbfield' => "ChoosenExams.Exams.name"],
        'free_exam.name' => ['type' => String::class,
                'dbfield' => "ChosenFreeChoiceExams.name",
                'modifier' => "LIKE"], 
        'modified' => Integer::class
    ];

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

        // clean the resulting data
        foreach($proposals as $proposal) {
            unset($proposal['attachments']);
            unset($proposal['chosen_free_choice_exams']);
            unset($proposal['chosen_exams']);
            unset($proposal['user']['password']);
            unset($proposal['user']['username']);
            unset($proposal['user']['number']);
            unset($proposal['user']['email']);
            unset($proposal['user']['admin']);
            unset($proposal['user']['name']);
            unset($proposal['user']['password']);
            unset($proposal['curriculum']['notes']);
            unset($proposal['curriculum']['notes']);
            unset($proposal['curriculum']['credits']); // non si cancella così
            unset($proposal['curriculum']['credits_per_year']);
            unset($proposal['curriculum']['degree']['years']);
            unset($proposal['curriculum']['degree']['enable_sharing']);
            unset($proposal['curriculum']['degree']['approval_confirmation']);
            unset($proposal['curriculum']['degree']['rejection_confirmation']);
            unset($proposal['curriculum']['degree']['submission_confirmation']);
            unset($proposal['curriculum']['degree']['free_choice_message']);
            unset($proposal['curriculum']['degree']['approval_message']);
            unset($proposal['curriculum']['degree']['rejection_message']);
            unset($proposal['curriculum']['degree']['submission_message']);
            unset($proposal['curriculum']['degree']['enabled']);
            unset($proposal['curriculum']['degree']['default_group_id']);            
        }        

        $this->JSONResponse(ResponseCode::Ok, $proposals);
    }

    public function get($id) {
        try {
            $p = $this->Proposals->get($id, [ 'contain' => array_merge(ProposalsController::$associations, [ 'ProposalAuths' ]) ]);
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