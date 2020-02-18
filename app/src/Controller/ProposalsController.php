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
      $proposals = $this->Proposals->find()
        ->contain([ 'Users', 'Curricula', 'Curricula.Degrees' ])
        ->order([ 'Users.surname' => 'asc' ]);
      $filterForm = new ProposalsFilterForm();
      $filterData = $this->request->getQuery();
      if (!key_exists('status', $filterData) || !$filterForm->validate($filterData)) {
        // no filter form provided or data not valid: set defaults:
        $filterData = [
          'status' => 'pending',
          'surname' => ''
        ];
      }
      $filterForm->setData($filterData);
      $proposals = $filterForm->filterProposals($proposals);
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
            $isProposalSubmitted = $proposal['submitted'];
            if ($isProposalSubmitted) {
                return $this->redirect(['action' => 'view', $proposal['id']]);
            }

            if ($this->request->is('post')) {
                $data = $this->request->getData()['data'];
                $cur_id = $this->request->getData()['Curriculum'][0]['curriculum_id'];

                if (array_key_exists('ChosenExam', $data))
                    $patch_data['chosen_exams'] = $data['ChosenExam'];
                if (array_key_exists('ChosenFreeChoiceExam', $data))
                    $patch_data['chosen_free_choice_exams'] = $data['ChosenFreeChoiceExam'];

                $proposal = $this->Proposals->patchEntity($proposal, $patch_data);

                $proposal['approved'] = false;
                $proposal['submitted'] = true;
                $proposal['frozen'] = false;
                $proposal['curriculum'] = [ $this->Proposals->Curricula->get($cur_id) ];

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

        $proposal['approved'] = true;
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

        $chosen_exams_table = TableRegistry::getTableLocator()->get('ChosenExams');
        $chosen_free_choice_exams_table = TableRegistry::getTableLocator()->get('ChosenFreeChoiceExams');

        foreach ($proposal['chosen_exams'] as $chosenExam):
            $chosen_exams_table->delete($chosenExam);
        endforeach;

        foreach ($proposal['chosen_free_choice_exams'] as $chosenFreeChoiceExam):
            $chosen_free_choice_exams_table->delete($chosenFreeChoiceExam);
        endforeach;

        $proposal['submitted'] = false;
        $proposal['approved'] = false;
        $proposal['frozen'] = false;
        $this->Proposals->save($proposal);

        return $this->redirect(
            ['controller' => 'proposals',
                'action' => 'index']
        );
    }

    public function adminFreeze ($id = null) {
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

        $proposal['frozen'] = true;
        $this->Proposals->save($proposal);

        return $this->redirect(
            ['controller' => 'proposals',
                'action' => 'index']
        );
    }

    public function adminThaw ($id = null) {
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

        $proposal['frozen'] = false;
        $this->Proposals->save($proposal);

        return $this->redirect(
            ['controller' => 'proposals',
                'action' => 'admin_frozen']
        );
    }

}

?>
