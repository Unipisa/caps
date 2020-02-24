<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
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
      $user = $this->Auth->user();

      $proposals = $this->Proposals->find();
      $proposals = $proposals
        ->contain([ 'Users', 'Curricula', 'Curricula.Degrees' ])
        ->order([ 'Users.surname' => 'asc' ]);

      if ($user['admin']) {
          // admin può vedere tutti i proposal
      } else {
          // posso vedere solo i miei proposal
          $proposals = $proposals->where(['Users.username' => $user['user']]);
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
      $this->set('filterForm', $filterForm);
      $this->set('proposals', $this->Paginator->paginate($proposals));
      $this->set('selected', 'index');
    }

    public function view ($id = null) {
        $user = $this->Auth->user();

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

        if ($proposal['user']['username'] != $user['user'] && !$user['admin']) {
            throw new ForbiddenException(__(''));
        }

        $this->set('proposal', $proposal);
				$this->set('_serialize', [ 'proposal' ]);
    }

    public function add ($proposal_id = null) {
	    $user = $this->Auth->user();
        $username = $user['user'];

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
					if ($proposal['user']['username'] != $user['user']) {
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
                $data = $this->request->getData()['data'];
                $cur_id = $this->request->getData()['curriculum_id'];

                if (array_key_exists('ChosenExam', $data))
                    $patch_data['chosen_exams'] = $data['ChosenExam'];
                if (array_key_exists('ChosenFreeChoiceExam', $data))
                    $patch_data['chosen_free_choice_exams'] = $data['ChosenFreeChoiceExam'];

                $proposal = $this->Proposals->patchEntity($proposal, $patch_data);

                $proposal['state'] = 'submitted';
                $proposal['curriculum_id'] = $cur_id;

                if ($this->Proposals->save($proposal)) {
                    return $this->redirect(['action' => 'view', $proposal['id']]);
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
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposals->get($id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['state'] = approved;
        $this->Proposals->save($proposal);

        return $this->redirect(
            ['controller' => 'proposals',
                'action' => 'index']
        );
    }

    public function adminReject ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
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
