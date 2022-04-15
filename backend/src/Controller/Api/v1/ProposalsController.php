<?php

namespace App\Controller\Api\v1;
use App\Controller\Api\v1\RestController;
use App\Model\Entity\Proposal;
use App\Model\Entity\ProposalAuth;
use Cake\Utility\Security;
use Cake\Validation\Validation;
use Cake\Mailer\Email;
use Cake\Http\Exception\ForbiddenException;


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

    public function post($id) {
        // $path is something like /api/v1/proposals/2050/share
        $path = parse_url($this->getRequest()->getRequestTarget(), PHP_URL_PATH);

        if (str_ends_with($path, "/share")) {
            return $this->share($id);
        } else {
            $this->JSONResponse(ResponseCode::Forbidden, null, "Bad request");
            return;
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

    function share($id) {
        try {
            $proposal = $this->Proposals->get($id, [ 'contain' => array_merge(ProposalsController::$associations, [ 'ProposalAuths' ]) ]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, "Proposal not found");
            return;
        }
        if (!$this->user['admin'] && $this->user['id'] != $proposal['user_id']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, "User cannot share this proposal");
            return;
        }

        if ($proposal['state'] != 'submitted') {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Si può chiedere un parere solo su piani inviati.');
            return;
        }

        if (! $proposal['curriculum']['degree']->isSharingEnabled($this->user)) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Richiesta parere disabilitata per questo corso di Laurea');
            return;
        }

        $data = json_decode($this->request->getBody());
        
        $proposal_auth = new ProposalAuth();
        $proposal_auth['proposal_id'] = $proposal['id'];
        $proposal_auth['email'] = $data->email;
        $proposal_auth['secret'] = base64_encode(Security::randomBytes(8));

        // Validate the email
        if (! Validation::email($proposal_auth['email']))
        {
            $this->JSONResponse(ResponseCode::BadRequest, 
                null, 'Email non valida');
            return;
        }

        if ($this->Proposals->ProposalAuths->save($proposal_auth)) {
            $email = $this->createProposalEmail($proposal)
            ->setTo($proposal_auth['email'])
            ->setSubject('[CAPS] richiesta di parere su piano di studi');
            $email->setViewVars(['proposal_auth' => $proposal_auth]);
            $email->viewBuilder()->setTemplate('share');
            
            try {
                $email->send();
            } catch (\Exception $e) {
                $this->log("Could not send the email: " . $e->getMessage());
            }
            $this->JSONResponse(ResponseCode::Ok, null, "inviato email a <{$proposal_auth['email']}> con richiesta di parere");
            return;
        } else {
            $this->JSONResponse(ResponseCode::Error, null, "Errore interno (database)");
            return;
        }
    }

    private function createProposalEmail($proposal)
    {
        $email = new Email();

        // Find the address that need to be notified in Cc, if any
        $cc_addresses = array_map(
            function ($address) {
                return trim($address);
            },
            explode(',', $this->getSetting('notified-emails'))
        );
        $cc_addresses = array_filter($cc_addresses, function ($address) {
            return trim($address) != "";
        });
        if (count($cc_addresses) > 0) {
            $email->addCc($cc_addresses);
        }

        $email->setViewVars([ 'settings' => $this->getSettings(), 'proposal' => $proposal ])
            ->setEmailFormat('html');

        return $email;
    }

}

?>