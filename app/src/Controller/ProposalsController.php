<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Model\Entity\ProposalAuth;
use Cake\Http\Exception\NotFoundException;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;
use Cake\Log\Log;
use App\Form\ProposalsFilterForm;
use Cake\Mailer\Email;
use Cake\I18n\Time;
use Cake\Core\Configure;
use Cake\Utility\Security;
use Dompdf\Dompdf;
use Cake\Database\Expression\QueryExpression;

class ProposalsController extends AppController {

    public $paginate = [
        'contain' => [ 'Users', 'Curricula.Degrees', 'Curricula' ],
        'sortWhitelist' => [ 'Users.surname', 'Degrees.name', 'academic_year', 'Curricula.name' ],
        'limit' => 10,
        'order' => [
            'Users.surname' => 'asc'
        ]
    ];

    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('Paginator');
        $this->loadComponent('RequestHandler');
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    private function get_proposal($id) {
        return $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula', 'ChosenExams.Exams',
                'ChosenExams.Exams.Tags', 'Attachments', 'Attachments.Users', 'ChosenExams.CompulsoryExams',
                'ChosenExams.CompulsoryGroups', 'ChosenExams.FreeChoiceExams',
                'ChosenFreeChoiceExams.FreeChoiceExams', 'ChosenExams.CompulsoryGroups.Groups',
                'Curricula.Degrees', 'ProposalAuths', 'Attachments.Proposals', 'Attachments.Proposals.ProposalAuths' ])
    ->firstOrFail();
    }

    private function createProposalEmail($proposal) {
        $email = new Email();

        // Find the address that need to be notified in Cc, if any
        $cc_addresses = array_map(function($address) { return trim($address); },
            explode(',', $this->getSetting('notified-emails')));
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

    private function notifySubmission($id) {
        if ($this->user['email'] == "" || $this->user['email'] == null)
            return;

        $email = $this->createProposalEmail($this->get_proposal($id))
            ->setTo($this->user['email'])
            ->setSubject('Piano di studi sottomesso');
        $email->viewBuilder()->setTemplate('submission');
        $email->send();
    }

    private function notifyApproval($id) {
        $proposal = $this->get_proposal($id);
        if ($proposal['user']['email'] == "" || $proposal['user']['email'] == null)
            return;

        $email = $this->createProposalEmail($proposal)
            ->setTo($proposal['user']['email'])
            ->setSubject('Piano di studi approvato');
        $email->viewBuilder()->setTemplate('approval');
        $email->send();
    }

    public function dashboard() {
        // We need to find a few stats about proposals
        $submitted_count = $this->Proposals->find()->where([ 'state' => 'submitted' ])->count();

        // Count the number of submission in the last twelve months; we do this by separate queries
        // because it appears to be difficult to do in a database-independent way.
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
                function(QueryExpression $exp) use($start, $end) {
                    return $exp->lt('submitted_date', $end)
                        ->gte('submitted_date', $start);
                })->count();
        }

        $query = $this->Proposals->find()
            ->contain([ 'Users', 'Curricula', 'Curricula.Degrees']);
        $proposal_comments = $query->select([
                'req' => $query->func()->count('ProposalAuths.id'),
                'att' => $query->func()->count('Attachments.id'),
                'req_date' => $query->func()->max('ProposalAuths.created')
            ])
            ->innerJoinWith('ProposalAuths')
            ->leftJoinWith('Attachments')
            ->group('Proposals.id')
            ->enableAutoFields(true)
            ->order([ 'req_date' => 'ASC' ]);

        $this->set(compact('submitted_count', 'submission_counts', 'proposal_comments'));
    }

    public function index()
    {
      $proposals = $this->Proposals->find()
        ->contain([ 'Users', 'Curricula', 'Curricula.Degrees' ]);

      if ($this->user['admin']) {
          // admin può vedere tutti i proposal
      } else {
          // posso vedere solo i miei proposal
          $proposals = $proposals->where(['Users.username' => $this->user['username']]);
      }

      $filterForm = new ProposalsFilterForm($proposals);
      $filterData = $this->request->getQuery();
      if (! $filterForm->validate($filterData)) {
        // no filter form provided or data not valid: set defaults:
        $filterData = [];
      }

      $proposals = $filterForm->execute($filterData);

      if ($this->request->is("post")) {
          if (!$this->user['admin']) {
              throw new ForbiddenException();
          }

          $action = null;
          foreach(['approve', 'reject', 'resubmit', 'redraft', 'delete'] as $i) {
              if ($this->request->getData($i)) {
                  if ($action) {
                      $this->Flash->error(__('richiesta non valida'));
                      return $this->redirect(['action' => 'index']);
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
                      'singular' => __('approvati')
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
                  $this->Flash->error(__('nessun piano selezionato'));
                  return $this->redirect(['action' => 'index']);
              }

              $count = 0;
              foreach($selected as $proposal_id) {
                  $proposal = $this->Proposals->findById($proposal_id)
                      ->firstOrFail();
                  if ($action === 'delete') {
                      if ($this->Proposals->delete($proposal)) {
                          $count ++;
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
                          default:
                              break;
                      }

                      if ($this->Proposals->save($proposal)) {
                          if ($context['state'] == 'approved') {
                              $this->notifyApproval($proposal['id']);
                          }

                          $count ++;
                      }
                  }
              }
              if ($count > 1) {
                  $this->Flash->success(__('{count} piani {what}', ['count' => $count, 'what' => $context['plural']]));
              } else if ($count == 1) {
                  $this->Flash->success(__('piano {what}', ['what' => $context['singular']]));
              } else {
                  $this->Flash->success(__('nessun piano {what}', ['what' => $context['singular']]));
              }
              return $this->redirect(['action' => 'index']);
          }
      }

      $this->set('data', $proposals);
      $this->set('_serialize', 'data');
      $this->set('filterForm', $filterForm);
      $this->set('proposals', $this->paginate($proposals->cleanCopy()));
      $this->set('selected', 'index');
    }

    public function view ($id) {
        $proposal = $this->get_proposal($id);

        // authorization
        $secret = $this->request->getQuery('secret');
        if (!$proposal->checkSecret($secret) && $proposal['user']['username'] != $this->user['username'] && !$this->user['admin']) {
            throw new ForbiddenException(__(''));
        }

        // Setup the message to show to the user
        switch ($proposal['state']) {
            case 'submitted':
                $message = $this->getSetting('submitted-message',
                    'Stampa il tuo Piano di Studi, firmalo e consegnalo in Segreteria Studenti.');
                break;
            case 'approved':
                $message = $this->getSetting('approved-message',
                    'Il tuo piano di studi è stato approvato.');
                break;
            default:
                $message = "";
        }

        $this->set('message', $message);
        $this->set('proposal', $proposal);

        // Having this is apparently the only way to enforce validation on
        // the e-mail given in the input.
        $this->set('proposal_auth', new ProposalAuth());

        // json_encode is not able to serialize resources.
        // hence we remove attachments before serializing
        $save_attachments = $proposal->attachments;
        $proposal->attachments = null;
        $this->set('proposal_json', json_encode($proposal));
        $proposal->attachments = $save_attachments;
        $this->set('_serialize', [ 'proposal' ]);
    }

    public function pdf($id) {
        $proposal = $this->get_proposal($id);
        $settings = $this->getSettings();
        $Caps = Configure::read('Caps');
        $app_path = APP;

        // authorization
        $secret = $this->request->getQuery('secret');
        if (!$proposal->checkSecret($secret) && $proposal['user']['username'] != $this->user['username'] && !$this->user['admin']) {
            throw new ForbiddenException(__(''));
        }

        $builder = $this->viewBuilder();
        $builder->setLayout(false);
        $builder->setTemplate('Proposals/pdf');
        $view = $builder->build(compact('proposal', 'settings', 'Caps', 'app_path'));

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
        return $this->response
            ->withStringBody($dompdf->output())
            ->withType('application/pdf')
            ->withDownload('prova.pdf');
    }

    public function view2 ($id) {
        $proposal = $this->get_proposal($id);

        // authorization
        $secret = $this->request->getQuery('secret');
        if (!$proposal->checkSecret($secret) && $proposal['user']['username'] != $this->user['username'] && !$this->user['admin']) {
            throw new ForbiddenException(__(''));
        }

        $this->set('proposal', $proposal);
        // json_encode is not able to serialize resources.
        // hence we remove attachments before serializing
        $save_attachments = $proposal->attachments;
        $proposal->attachments = null;
        $this->set('proposal_json', json_encode($proposal));
        $proposal->attachments = $save_attachments;
        $this->set('_serialize', [ 'proposal' ]);
    }

    public function delete($id) {
        if (! $id) {
            throw new NotFoundException();
        }

        // Fetch the proposal from the database
        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula' ])
            ->firstOrFail();

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone delete
        // of the given proposal.
        if ($proposal['user']['username'] != $this->user['username'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a eliminare questo piano');
        }

        if ($proposal['state'] == 'approved' || $proposal['state'] == 'submitted' || $proposal['state'] == 'rejected') {
            throw new ForbiddenException('Impossibile eliminare un piano non in stato \'bozza\'');
        }

        if ($this->Proposals->delete($proposal)) {
            $this->Flash->success('Piano eliminato');
        }
        else {
            $this->log('Errore nella cancellazione del piano con ID = ' . $proposal['id']);
            $this->log(var_export($proposal->errors(), TRUE));
            $this->Flash->error('Impossibile eliminare il piano');
        }

        return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
    }

    public function duplicate($id) {
        if (! $id) {
            throw new NotFoundException();
        }

        // Fetch the proposal from the database
        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula' ])
            ->firstOrFail();

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone make a duplicate
        // of the given proposal.
        if ($proposal['user']['username'] != $this->user['username'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a clonare questo piano');
        }

        // Create a copy of the proposal, and set the corresponding data
        $newp = $this->Proposals->newEntity($proposal->toArray());

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
            return $this->redirect([ 'action' => 'add', $newp['id'] ]);
        }
        else {
            $this->Flash->error('Errore nel salvataggio del piano');
            $this->log(var_export($newp->errors(), TRUE));
            return $this->redirect([ 'controller' => 'users', 'action' => 'index' ]);
        }
    }

    public function add ($proposal_id = null) {
        $username = $this->user['username'];

        // Find the user in the database matching the one logged in
        $user = $this->Proposals->Users->find()->contain([ 'Proposals' ])
            ->where([ 'Users.username' => $username ])
            ->firstOrFail();

        if ($proposal_id != null) {
            $proposal = $this->Proposals->find()->contain([
                'Curricula', 'Users', 'ChosenExams', 'ChosenFreeChoiceExams' ])
                ->where([ 'Proposals.id' => $proposal_id ])
                ->firstOrFail();

            // Check if the user is the right user
            if ($proposal['user']['id'] != $this->user['id']) {
                throw new ForbiddenException();
            }
        }
        else {
            $proposal = $this->Proposals->newEntity();
            $proposal->user = $user;
        }

        if ($user) {
            if ($proposal['state'] === 'submitted') {
                return $this->redirect(['action' => 'view', $proposal['id']]);
            }

            if ($this->request->is('post')) {
                // Select the action desired by the user
                if (array_key_exists('action-close', $this->request->getData())) {
                    $action = 'close';
                }
                else {
                    $action = 'save';
                }

                $data = $this->request->getData('data');
                $cur_id = $this->request->getData('curriculum_id');

                if ($data == null)
                    $data = [];

                $patch_data = [];
                if (array_key_exists('ChosenExam', $data)) {
                    $patch_data['chosen_exams'] = array_filter($data['ChosenExam'], function($e) {
                        return array_key_exists('exam_id', $e);
                    });
                }
                if (array_key_exists('ChosenFreeChoiceExam', $data))
                    $patch_data['chosen_free_choice_exams'] = $data['ChosenFreeChoiceExam'];

                // If the proposal was already submitted, we may have the data set in chosen_exams and
                // chosen_free_choice_exams: we need to get rid of it to replace with the new one.
                $this->Proposals->ChosenExams->deleteAll([ 'proposal_id' => $proposal['id'] ]);
                $this->Proposals->ChosenFreeChoiceExams->deleteAll([ 'proposal_id' => $proposal['id'] ]);

                $proposal['chosen_exams'] = [];
                $proposal['chosen_free_choice_exams'] = [];

                if (! $proposal->isNew())
                    $this->Proposals->save($proposal);

                $proposal = $this->Proposals->patchEntity($proposal, $patch_data);

                if ($action == 'close') {
                    // Before saving, if the action is 'action-close', we need to check if the user has already submitted
                    // other proposals. If that's the case, we save it as draft and throw an error.
                    $previous_proposals = $this->Proposals->find()->contain(['Users'])
                        ->where(['Users.username' => $username, 'state' => 'submitted'])
                        ->count();

                    if ($previous_proposals > 0) {
                        $this->Flash->error('Non è possibile sottomettere più di un piano alla volta: il piano è stato salvato come bozza.');
                        $proposal['state'] = 'draft';
                    }
                    else {
                        $proposal['state'] = 'submitted';
                        $proposal['submitted_date'] = Time::now();
                    }
                }
                else {
                    $proposal['state'] = 'draft';
                }

                $proposal['curriculum_id'] = $cur_id;

                if ($this->Proposals->save($proposal)) {
                    if ($proposal['state'] == 'submitted') {
                        $this->notifySubmission($proposal['id']);
                        return $this->redirect(['action' => 'view', $proposal['id']]);
                    }
                    else
                        return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
                }
                else {
                    debug(var_export($proposal->errors(), TRUE));
                    $this->Flash->error(Utils::error_to_string($proposal->errors()));
                    return $this->redirect(['action' => 'add', $proposal['id']]);
                }
            }

            $this->set('curricula', $this->Proposals->Curricula
                ->find()
                ->contain([ 'Degrees' ])
                ->find('list', [
                    'valueField' => function($c) {
                        return $c->toString();
                    }
                ])
            );
            $this->set('proposal', $proposal);
        } else {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }
    }

    public function share ($id) {
        $proposal = $this->get_proposal($id);

        if (!$this->user['admin'] && $this->user['id']!=$proposal['user_id']) {
            throw new ForbiddenException();
        }

        if ($proposal['state'] != 'submitted') {
            throw new ForbiddenException('Si può chiedere un parere solo su piani sottomessi.');
        }

        if (! $proposal['curriculum']['degree']['enable_sharing']) {
            throw new ForbiddenException('Richiesta parere disabilitata per questo corso di Laurea');
        }

        $proposal_auth = $this->Proposals->ProposalAuths->newEntity();

        if ($this->request->is('post')) {
            $proposal_auth['proposal_id'] = $proposal['id'];
            $proposal_auth['email'] = $this->request->getData('email');
            $proposal_auth['secret'] = base64_encode(Security::randomBytes(8));

            if ($this->Proposals->ProposalAuths->save($proposal_auth)) {
                $email = $this->createProposalEmail($proposal)
                ->setTo($proposal_auth['email'])
                ->setSubject('[CAPS] richiesta di parere su piano di studi');
                $email->setViewVars(['proposal_auth' => $proposal_auth]);
                $email->viewBuilder()->setTemplate('share');
                $email->send();
                $this->Flash->success("inviato email a <{$proposal_auth['email']}> con richiesta di parere");
            }
            else {
                debug(var_export($proposal_auth->errors(), TRUE));
                $this->Flash->error("ERROR: " . Utils::error_to_string($proposal->errors()));
            }

            return $this->redirect(['action' => 'view', $proposal['id']]);
        }
        $this->set('proposal_auth', $proposal_auth);
    }

    public function adminApprove ($id = null) {
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
            ['controller' => 'proposals',
                'action' => 'index']
        );
    }

    public function adminReject ($id = null) {
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
        $this->Proposals->save($proposal);

        return $this->redirect(
            ['controller' => 'proposals',
                'action' => 'index']
        );
    }
}

?>
