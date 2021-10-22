<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */

namespace App\Controller;

use App\Caps\Utils;
use App\Form\ProposalsFilterForm;
use App\Model\Entity\Proposal;
use App\Model\Entity\ProposalAuth;
use Cake\Core\Configure;
use Cake\Database\Expression\QueryExpression;
use Cake\Http\Exception\NotFoundException;
use Cake\Http\Exception\ForbiddenException;
use Cake\Mailer\Email;
use Cake\I18n\Time;
use Cake\Utility\Security;
use Cake\Validation\Validation;
use Dompdf\Dompdf;
use DateTime;

class ProposalsController extends AppController
{
    public $paginate = [
        'contain' => [ 'Users', 'Curricula.Degrees', 'Curricula' ],
        'sortableFields' => [ 'Users.surname', 'Degrees.name', 'academic_year', 'Curricula.name', 'modified' ],
        'limit' => 10,
        'order' => [
            'modified' => 'desc'
        ]
    ];

    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('Paginator');
        $this->loadComponent('RequestHandler');
    }

    public function beforeFilter(\Cake\Event\EventInterface $event)
    {
        parent::beforeFilter($event);
    }

    private function get_proposal($id)
    {
        return $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula', 'ChosenExams.Exams',
                'ChosenExams.Exams.Tags', 'Attachments', 'Attachments.Users', 'ChosenExams.CompulsoryExams',
                'ChosenExams.CompulsoryGroups', 'ChosenExams.FreeChoiceExams',
                'ChosenExams.CompulsoryGroups.Groups',
                'Curricula.Degrees', 'ProposalAuths', 'Attachments.Proposals', 'Attachments.Proposals.ProposalAuths' ])
        ->firstOrFail();
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

    private function notifySubmission($id)
    {
        if ($this->user['email'] == "" || $this->user['email'] == null) {
            return;
        }

        $proposal = $this->get_proposal($id);

        if (! $proposal['curriculum']['degree']['submission_confirmation'])
            return;

        $email = $this->createProposalEmail($proposal)
            ->setTo($this->user['email'])
            ->setSubject('Piano di studi sottomesso');
        $email->viewBuilder()->setTemplate('submission');
        try {
            $email->send();
        } catch (\Exception $e) {
            $this->log("Could not send the submission confirmation email: " . $e->getMessage());
        }
    }

    private function notifyApproval($id)
    {
        $proposal = $this->get_proposal($id);
        if ($proposal['user']['email'] == "" || $proposal['user']['email'] == null) {
            return;
        }

        if (! $proposal['curriculum']['degree']['approval_confirmation'])
            return;

        $email = $this->createProposalEmail($proposal)
            ->setTo($proposal['user']['email'])
            ->setSubject('Piano di studi approvato');
        $email->viewBuilder()->setTemplate('approval');

        try {
            $email->send();
        } catch (\Exception $e) {
            $this->log("Could not send the approval email: " . $e->getMessage());
        }
    }

    private function notifyRejection($id)
    {
        $proposal = $this->get_proposal($id);

        if ($proposal['user']['email'] == "" || $proposal['user']['email'] == null) {
            return;
        }
        
        if (! $proposal['curriculum']['degree']['rejection_confirmation'])
            return;

        $email = $this->createProposalEmail($proposal)
            ->setTo($proposal['user']['email'])
            ->setSubject('Piano di studi rigettato');
        $email->viewBuilder()->setTemplate('rejection');
        try {
            $email->send();
        } catch (\Exception $e) {
            $this->log("Could not send the rejection email: " . $e->getMessage());
        }    
    }

    /** 
     * Get the number of submissions groups per month, in the last 12 months, 
     * including the current one. 
     */
    private function get_submission_counts($date_field) {
        // we do this by separate queries because it appears to be
        // difficult to do in a database-independent way.
        $start = Time::now();
        $start->day(1); // Go the start of this month
        $start = $start->addMonth(-12);
        $end = new Time($start);
        $end = $end->addMonth(1);
        $submission_counts = [];

        for ($i = 0; $i < 12; $i++) {
            $start = $start->addMonth(1);
            $end   = $end->addMonth(1);

            $submission_counts[$i] = $this->Proposals->find()->where(
                function (QueryExpression $exp) use ($start, $end, $date_field) {
                    return $exp->lt($date_field, $end)
                        ->gte($date_field, $start);
                }
            )->count();
        }

        return $submission_counts;
    }

    public function dashboard()
    {
        // We need to find a few stats about proposals
        $submitted_count = $this->Proposals->find()->where([ 'state' => 'submitted' ])->count();

        // Raw SQL query, as this appear to be quite hard to be done using
        // Cake's ORM Query & co. This query selects all the proposals where there is
        // at least one request, and either no attachments, or the most recent attachment
        // is older than the most recent request.
        $conn = $this->Proposals->getConnection();
        $proposal_comments = $conn->execute(
            'SELECT proposals.id AS id, 
                    users.name AS user_name, 
                    users.id AS user_id,
                    req_date,
                    curricula.name AS curriculum_name 
                    FROM (SELECT proposals.id AS id, COUNT(attachments.id) AS att, COUNT(proposal_auths.id) AS req, 
                    MAX(proposal_auths.created) AS req_date,
                    MAX(attachments.created) AS att_date 
                    FROM proposals 
                    INNER JOIN proposal_auths ON proposals.id = proposal_auths.proposal_id
                    LEFT JOIN attachments ON proposals.id = attachments.proposal_id
                    GROUP BY proposals.id) proposals_counts
                    LEFT JOIN proposals ON proposals_counts.id = proposals.id
                    LEFT JOIN curricula ON proposals.curriculum_id = curricula.id
                    LEFT JOIN users ON proposals.user_id = users.id
                    WHERE (att = 0 OR att_date < req_date) AND state = \'submitted\'
                    ORDER BY req_date ASC'
        );

        $this->set(compact('submitted_count', 'proposal_comments'));
    }

    /**
     * Some data in the dashboard is loaded asynchronously through JS. 
     * 
     * This function provides an interface for that data.
     */
    public function dashboardData() {
        $submission_counts = $this->get_submission_counts('submitted_date');
        $approval_counts = $this->get_submission_counts('approved_date');

        $this->set(compact('submission_counts', 'approval_counts'));
        $this->viewBuilder()->setOption('serialize', [
            'submission_counts', 'approval_counts'
        ]);
    }

    public function index()
    {
        $proposals = $this->Proposals->find()
            ->contain([ 'Users', 'Curricula', 'Curricula.Degrees' ]);

        if ($this->user['admin']) {
            // admin può vedere tutti i proposal
        } else {
            // posso vedere solo i miei proposal
            $proposals = $proposals->where(['Users.id' => $this->user['id']]);
        }

        $filterForm = new ProposalsFilterForm($proposals);
        $proposals = $filterForm->validate_and_execute($this->request->getQuery());

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }

            $action = null;
            foreach (['approve', 'reject', 'resubmit', 'redraft', 'delete'] as $i) {
                if ($this->request->getData($i)) {
                    if ($action) {
                        $this->Flash->error(__('Richiesta non valida'));
                        return $this->redirect($this->referer());
                    }
                    $action = $i;
                }
            }

            if ($action) {
                $context = [
                  'approve' => [
                      'state' => 'approved',
                      'plural' => __('approvati'),
                      'singular' => __('approvato')
                  ],
                  'reject' => [
                      'state' => 'rejected',
                      'plural' => __('rifiutati'),
                      'singular' => __('rifiutato')
                  ],
                  'resubmit' => [
                      'state' => 'submitted',
                      'plural' => __('risottomessi'),
                      'singular' => __('risottomesso')
                  ],
                  'redraft' => [
                      'state' => 'draft',
                      'plural' => __('riportati in bozza'),
                      'singular' => __('riportato in bozza')
                  ],
                  'delete' => [
                      'plural' => __('eliminati'),
                      'singular' => __('eliminato')
                  ]][$action];

                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('Nessun piano selezionato'));
                    return $this->redirect($this->referer());
                }

                $count = 0;
                foreach ($selected as $proposal_id) {
                    $proposal = $this->Proposals->findById($proposal_id)
                      ->firstOrFail();
                    if ($action === 'delete') {
                        if ($this->Proposals->delete($proposal)) {
                            $count++;
                        }
                    } else {
                        $proposal['state'] = $context['state'];

                        switch ($context['state']) {
                            case 'approved':
                                $proposal['approved_date'] = Time::now();
                                break;
                            case 'submitted':
                                $proposal['submitted_date'] = Time::now();
                                break;
                            case 'rejected':
                                $proposal['approved_date'] = null;
                                break;
                            default:
                                break;
                        }

                        if ($this->Proposals->save($proposal)) {
                            if ($context['state'] == 'approved') {
                                $this->notifyApproval($proposal['id']);
                            }
                            if ($context['state'] == 'rejected') {
                                $this->notifyRejection($proposal['id']);
                            }

                            $count++;
                        }
                    }
                }
                if ($count > 1) {
                    $this->Flash->success(__('{count} piani {what}', ['count' => $count, 'what' => $context['plural']]));
                } elseif ($count == 1) {
                    $this->Flash->success(__('Piano {what}', ['what' => $context['singular']]));
                } else {
                    $this->Flash->success(__('Nessun piano {what}', ['what' => $context['singular']]));
                }

                return $this->redirect($this->referer());
            }
        }

        $this->set('data', $proposals);
        $this->viewBuilder()->setOption('serialize', 'data');
        $this->set('filterForm', $filterForm);
        $this->set('proposals', $this->paginate($proposals->cleanCopy()));
        $this->set('selected', 'index');
    }

    public function view($id)
    {
        $proposal = $this->get_proposal($id);

        // authorization
        $secrets = $this->getSecrets();
        if (!$proposal->checkSecrets($secrets) && $proposal['user']['id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException(__('Invalid secret, or no permissions'));
        }

        // Remove secrets that the user does not own, otherwise they may
        // be exposed, and in general they belong to different users.
        $proposal = $proposal->removeSecrets($secrets);

        $this->set('proposal', $proposal);
        $this->set('secrets', $secrets);

        // Having this is apparently the only way to enforce validation on
        // the e-mail given in the input.
        $this->set('proposal_auth', new ProposalAuth());
        $this->viewBuilder()->setOption('serialize', 'proposal');
    }

    public function pdf($id)
    {
        $proposal = $this->get_proposal($id);
        $settings = $this->getSettings();
        $Caps = Configure::read('Caps');
        $app_path = APP;
        $show_comments = $this->request->getQuery('show_comments', false);

        // authorization
        $secrets = $this->getSecrets();
        if (!$proposal->checkSecrets($secrets) && $proposal['user']['id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException(__(''));
        }

        $builder = $this->viewBuilder();
        $builder->disableAutoLayout();
        $builder->setTemplate('Proposals/pdf');
        $pdf = true;
        $view = $builder->build(compact('proposal', 'settings', 'Caps', 'app_path', 'secrets', 'user', 'pdf', 'show_comments'));

        // Generate the PDF
        $dompdf = new Dompdf();
        $options = $dompdf->getOptions();
        $options->setIsHtml5ParserEnabled(true);
        $options->setIsRemoteEnabled(false);
        $options->setDpi(600);
        $dompdf->setOptions($options);
        $dompdf->loadHtml($view->render());
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Send out the PDF
        $settings = $this->getSettings();
        $filename_template = $settings['pdf-name'];
        if ($filename_template == '') {
            $filename = str_replace(' ', '-',
                'caps_'
                . substr($proposal['modified']->format(DateTime::ATOM), 0, 10) . '_'
                . $proposal['user']['number'] . '_'
                . $proposal['user']['surname'] . '_'
                . $proposal['curriculum']['name']
                . '.pdf');
        }
        else
        {
            $date = substr($proposal['modified']->format(DateTime::ATOM), 0, 10);
            $name = $proposal['user']['givenname'];
            $surname = $proposal['user']['surname'];
            $curriculum = $proposal['curriculum']['name'];
            $filename = $filename_template . '.pdf';
            $filename = str_replace('%d', $date, $filename);
            $filename = str_replace('%n', $name, $filename);
            $filename = str_replace('%s', $surname, $filename);
            $filename = str_replace('%c', $curriculum, $filename);
        }

        return $this->response
            ->withStringBody($dompdf->output())
            ->withType('application/pdf')
            ->withDownload($filename);

    }

    public function delete($id)
    {
        if (! $id) {
            throw new NotFoundException();
        }

        // Fetch the proposal from the database
        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula' ])
            ->firstOrFail();

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone delete
        // of the given proposal.
        if ($proposal['user']['id'] != $this->user['id'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a eliminare questo piano');
        }

        if ($proposal['state'] != 'draft' && !$this->user['admin']) {
            throw new ForbiddenException('Impossibile eliminare un piano se non è in stato \'bozza\'');
        }

        if ($this->Proposals->delete($proposal)) {
            $this->Flash->success('Piano eliminato');
        } else {
            $this->log('Errore nella cancellazione del piano con ID = ' . $proposal['id']);
            $this->Flash->error('Impossibile eliminare il piano');
        }

        return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
    }

    public function duplicate($id)
    {
        if (! $id) {
            throw new NotFoundException();
        }

        // Fetch the proposal from the database
        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula' ])
            ->firstOrFail();

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone make a duplicate
        // of the given proposal.
        if ($proposal['user']['id'] != $this->user['id'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a duplicare questo piano');
        }

        // Create a copy of the proposal, and set the corresponding data
        $newp = new Proposal($proposal->toArray());
        
        $newp['id'] = null;

        // Set the user to NULL so that it won't be saved
        $newp->user = null;

        // The new plan should be in the draft state
        $newp->state = 'draft';

        // Reset also the submitted and approved dates
        $newp->submitted_date = null;
        $newp->approved_date  = null;

        // For each of the selected exams we need to clear the ID, so that saving this object will create new entities
        // for the selections, making this proposal effectively independent of the original one.
        foreach ($newp['chosen_exams'] as $key => &$chosen_exam) {
            $chosen_exam['id'] = null;
        }

        foreach ($newp['chosen_free_choice_exams'] as $key => &$free_choice_exam) {
            $free_choice_exam['id'] = null;
        }

        // Save the proposal and redirect the user to the new plan
        if ($this->Proposals->save($newp)) {
            return $this->redirect([ 'action' => 'edit', $newp['id'] ]);
        } else {
            $this->Flash->error('Errore nel salvataggio del piano');
            $this->log('Errore nel salvataggio del piano con id = ' . $proposal['id'] . '\n');

            if ($proposal->hasErrors()) {
                $this->log(var_export($proposal->getErrors(), true));
            }
            else {
                $this->log("Il piano non contiene errori.");
            }

            return $this->redirect([ 'controller' => 'users', 'action' => 'index' ]);
        }
    }

    public function edit($proposal_id = null)
    {
        if ($proposal_id != null) {
            $proposal = $this->Proposals->find()->contain([
                'Curricula', 'Users', 'ChosenExams', 'ChosenFreeChoiceExams' ])
                ->where([ 'Proposals.id' => $proposal_id ])
                ->firstOrFail();

            // Check if the user is the right user
            if ($proposal['user']['id'] != $this->user['id'] && !$this->user['admin']) {
                throw new ForbiddenException();
            }
        } else {
            $proposal = new Proposal();
            $proposal->user = $this->user;
        }

        if ($proposal['state'] === 'submitted') {
            return $this->redirect(['action' => 'view', $proposal['id']]);
        }

        if ($this->request->is('post')) {
            // Select the action desired by the user
            if (array_key_exists('action-close', $this->request->getData())) {
                $action = 'close';
            } else {
                $action = 'save';
            }

            $data = $this->request->getData('data');
            $cur_id = $this->request->getData('curriculum_id');

            if ($data == null) {
                $data = [];
            }

            $patch_data = [];
            if (array_key_exists('ChosenExam', $data)) {
                $patch_data['chosen_exams'] = array_filter($data['ChosenExam'], function ($e) {
                    return array_key_exists('exam_id', $e);
                });
            }
            if (array_key_exists('ChosenFreeChoiceExam', $data)) {
                $patch_data['chosen_free_choice_exams'] = $data['ChosenFreeChoiceExam'];
            }

            // If the proposal was already submitted, we may have the data set in chosen_exams and
            // chosen_free_choice_exams: we need to get rid of it to replace with the new one.
            if ($proposal['id'] != null) {
                $this->Proposals->ChosenExams->deleteAll([ 'proposal_id' => $proposal['id'] ]);
                $this->Proposals->ChosenFreeChoiceExams->deleteAll([ 'proposal_id' => $proposal['id'] ]);
            }

            $proposal['chosen_exams'] = [];
            $proposal['chosen_free_choice_exams'] = [];

            if (! $proposal->isNew()) {
                $this->Proposals->save($proposal);
            }

            $proposal = $this->Proposals->patchEntity($proposal, $patch_data);

            if ($action == 'close') {
                // Before saving, if the action is 'action-close', we need to check if the user has already submitted
                // other proposals. If that's the case, we save it as draft and throw an error.
                $previous_proposals = $this->Proposals->find()->contain(['Users'])
                    ->where(['Users.id' => $this->user->id, 'state' => 'submitted'])
                    ->count();

                if ($previous_proposals > 0) {
                    $this->Flash->error('Non è possibile sottomettere più di un piano alla volta: il piano è stato salvato come bozza.');
                    $proposal['state'] = 'draft';
                } else {
                    $proposal['state'] = 'submitted';
                    $proposal['submitted_date'] = Time::now();
                }
            } else {
                $proposal['state'] = 'draft';
            }

            $proposal['curriculum_id'] = $cur_id;

            if ($this->Proposals->save($proposal)) {
                if ($proposal['state'] == 'submitted') {
                    $this->notifySubmission($proposal['id']);

                    return $this->redirect(['action' => 'view', $proposal['id']]);
                } else {
                    return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
                }
            } else {
                $this->Flash->error("Errore nel salvataggio del piano.");

                $this->log('Errore nel salvataggio del piano con id = ' . $proposal['id'] . '\n');

                if ($proposal->hasErrors()) {
                    $this->log(var_export($proposal->getErrors(), true));
                }
                else {
                    $this->log("Il piano non contiene errori.");
                }

                if ($proposal['id'])
                {
                    return $this->redirect(['action' => 'edit', $proposal['id']]);
                }
                else
                {
                    return $this->redirect(['controller' => 'users', 'action' => 'view' ]);
                }
            }
        }

        $this->set(
            'curricula',
            $this->Proposals->Curricula
            ->find()
            ->contain([ 'Degrees' ])
            ->find('list', [
                'valueField' => function ($c) {
                    return $c->toString();
                }
            ])
        );
        $this->set('proposal', $proposal);
    }

    public function share($id)
    {
        $proposal = $this->get_proposal($id);

        if (!$this->user['admin'] && $this->user['id'] != $proposal['user_id']) {
            throw new ForbiddenException();
        }

        if ($proposal['state'] != 'submitted') {
            throw new ForbiddenException('Si può chiedere un parere solo su piani sottomessi.');
        }

        if (! $proposal['curriculum']['degree']->isSharingEnabled($this->user)) {
            throw new ForbiddenException('Richiesta parere disabilitata per questo corso di Laurea');
        }

        $proposal_auth = new ProposalAuth();

        if ($this->request->is('post')) {
            $proposal_auth['proposal_id'] = $proposal['id'];
            $proposal_auth['email'] = $this->request->getData('email');
            $proposal_auth['secret'] = base64_encode(Security::randomBytes(8));

            // Validate the email
            if (! Validation::email($proposal_auth['email']))
            {
                $this->Flash->error('Email non valida');
                return $this->redirect(['action' => 'view', $proposal['id']]);
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

                $this->Flash->success("inviato email a <{$proposal_auth['email']}> con richiesta di parere");
            } else {
                $this->Flash->error("Errore nella condivisione del piano ");
            }

            return $this->redirect(['action' => 'view', $proposal['id']]);
        }
        $this->set('proposal_auth', $proposal_auth);
    }

    public function adminApprove($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposals->get($id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['state'] = 'approved';
        $proposal['approved_date'] = Time::now();
        $this->Proposals->save($proposal);
        $this->notifyApproval($proposal['id']);

        return $this->redirect(
            [ 'controller' => 'proposals', 'action' => 'view', $id ]
        );
    }

    public function adminReject($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposals->findById($id)
            ->contain([ 'ChosenExams', 'ChosenFreeChoiceExams' ])
            ->firstOrFail();
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['state'] = 'rejected';
        $proposal['approved_date'] = null;
        $this->Proposals->save($proposal);
        $this->notifyRejection($proposal['id']);

        return $this->redirect(
            [ 'controller' => 'proposals', 'action' => 'view', $id ]
        );
    }
}
