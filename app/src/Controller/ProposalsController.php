<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\Http\Exception\NotFoundException;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;
use Cake\Log\Log;
use App\Form\ProposalsFilterForm;

class ProposalsController extends AppController {

    public function initialize()
    {
        parent::initialize();

        $this->loadComponent('RequestHandler');
        $this->loadComponent('Paginator');
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index()
    {
      $proposals = $this->Proposals->find();
      $proposals = $proposals
        ->contain([ 'Users', 'Curricula', 'Curricula.Degrees' ])
        ->order([ 'Users.surname' => 'asc' ]);

      if ($this->user['admin']) {
          // admin può vedere tutti i proposal
      } else {
          // posso vedere solo i miei proposal
          $proposals = $proposals->where(['Users.username' => $this->user['user']]);
      }

      $filterForm = new ProposalsFilterForm($proposals);
      $filterData = $this->request->getQuery();
      if (!key_exists('state', $filterData) || !$filterForm->validate($filterData)) {
        // no filter form provided or data not valid: set defaults:
        $filterData = [
          'state' => 'submitted',
          'surname' => ''
        ];
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
                      if ($this->Proposals->save($proposal)) {
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

      $this->set('filterForm', $filterForm);
      $this->set('proposals', $this->Paginator->paginate($proposals));
      $this->set('selected', 'index');
    }

    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException('');
        }

        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula', 'ChosenExams.Exams',
						'ChosenExams.CompulsoryExams', 'ChosenExams.CompulsoryGroups', 'ChosenExams.FreeChoiceExams',
						'ChosenFreeChoiceExams.FreeChoiceExams', 'ChosenExams.CompulsoryGroups.Groups', 'Curricula.Degrees' ])
            ->firstOrFail();

        if (!$proposal) {
            throw new NotFoundException('');
        }

        if ($proposal['user']['username'] != $this->user['user'] && !$this->user['admin']) {
            throw new ForbiddenException(__(''));
        }

        $this->set('proposal', $proposal);
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
        if ($proposal['user']['username'] != $this->user['user'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a eliminare questo piano');
        }

        if ($proposal['state'] != 'draft') {
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
        if ($proposal['user']['username'] != $this->user['user'] && ! $this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a clonare questo piano');
        }

        // Create a copy of the proposal, and set the corresponding data
        $newp = $this->Proposals->newEntity($proposal->toArray());

        // Set the user to NULL so that it won't be saved
        $newp->user = null;

        // The new plan should be in the draft state
        $newp->state = 'draft';

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
        $username = $this->user['user'];

        // Find the user in the database matching the one logged in
        $owner = $this->Proposals->Users->find()->contain([ 'Proposals' ])
            ->where([ 'Users.username' => $username ])
            ->firstOrFail();

				if ($proposal_id != null) {
					$proposal = $this->Proposals->find()->contain([
            	        'Curricula', 'Users', 'ChosenExams', 'ChosenFreeChoiceExams' ])
						->where([ 'Proposals.id' => $proposal_id ])
						->firstOrFail();

					// Check if the user is the right owner
					if ($proposal['user']['username'] != $this->user['user']) {
						throw ForbiddenException('Il piano di studi non è di proprietà di questo utente');
					}
				}
				else {
					$proposal = $this->Proposals->newEntity();
					$proposal->user = $owner;
				}

        if ($owner) {
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
                    }
                }
                else {
                    $proposal['state'] = 'draft';
                }

                $proposal['curriculum_id'] = $cur_id;

                if ($this->Proposals->save($proposal)) {
                    if ($proposal['state'] == 'submitted')
                        return $this->redirect(['action' => 'view', $proposal['id']]);
                    else
                        return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
                }
                else {
                    $this->Flash->error(Utils::error_to_string($proposal->errors()));
                    return $this->redirect(['action' => 'view', $proposal['id']]);
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
            $this->set('owner', $owner);
        } else {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }
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
        $this->Proposals->save($proposal);

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
