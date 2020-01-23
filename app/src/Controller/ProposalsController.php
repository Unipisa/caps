<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;

class ProposalsController extends AppController {

    public function initialize()
    {
        parent::initialize();

        $this->loadComponent('RequestHandler');
        $this->loadComponent('Paginator');
    }

    private function done()
    {
        return $this->Proposals->find()->contain([ 'Users', 'Curricula' ])
            ->where([ 'Proposals.approved' => true, 'Proposals.frozen' => false ])
            ->limit(25)
            ->order('Users.surname', 'asc'); // FIXME: Originally, the data was ordered by surname
    }

    private function todo()
    {
        return $this->Proposals->find()->contain([ 'Users', 'Curricula' ])
            ->where([
                'submitted' => true,
                'approved' => false
            ])
            ->limit(25)
            ->order('Users.surname', 'asc'); // FIXME: Originally, the data was ordered by surname
    }

    private function frozen()
    {
        return $this->Proposals->find()->contain([ 'Users', 'Curricula' ])
            ->where([ 'Proposals.frozen' => true ])
            ->limit(25)
            ->order('Users.surname', 'asc'); // FIXME: Originally, the data was ordered by surname
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminTodo () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $this->set('proposalsTodo', $this->Paginator->paginate($this->todo()));
        $this->set('selected', 'todo');
    }

    public function adminDone () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $this->set('proposalsApproved', $this->Paginator->paginate($this->done()));
        $this->set('selected', 'done');
    }

    public function adminFrozen () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $this->set('proposalsFrozen', $this->Paginator->paginate($this->frozen()));
        $this->set('selected', 'frozen');
    }

    public function view ($id = null) {
        $user = $this->Auth->user();

        if (!$id) {
            throw new NotFoundException('');
        }

        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'ChosenExams', 'ChosenFreeChoiceExams', 'Curricula' ])
            ->firstOrFail();

        if (!$proposal) {
            throw new NotFoundException('');
        }

				$this->log(var_export($proposal['user']['username'], TRUE));
				$this->log(var_export($user['user'], TRUE));

        if ($proposal['user']['username'] != $user['user']) {
            throw new ForbiddenException(__(''));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');

        $exams = $exams_table->find('all', [
            'recursive' => -1
        ]);

        $this->set('proposal', $proposal);
        $this->set('exams', $exams);
    }

    public function add ($proposal_id = null) {
	    $user = $this->Auth->user();
      $username = $user['user'];

        // Find the user in the database matching the one logged in
        $owner = $this->Proposals->Users->find()->contain([ 'Proposals' ])
            ->where([ 'Users.username' => $username ])
            ->firstOrFail();

				if ($proposal_id != null) {
					$proposal = $this->Proposals->find()->contain([ 'Curricula', 'Users', 'ChosenExams', 'ChosenFreeChoiceExams' ])
						->where([ 'id' => $proposal_id ])
						->firstOrFail();

					// Check if the user is the right owner
					if ($proposal['username'] != $user['user']) {
						throw ForbiddenException('Il piano di studi non è di proprietà di questo utente');
					}
				}
				else {
					$proposal = $this->Proposals->newEntity();
					$proposal->user = $owner;
				}

        if ($owner) {
            // $proposal = $owner['proposal'];
            /* $proposalId = $proposal['id'];

            $proposal = $this->Proposals->findById($proposalId)
            	->contain([ 'Curricula', 'Users', 'ChosenExams', 'ChosenFreeChoiceExams' ])
							->firstOrFail(); */

            $isProposalSubmitted = $proposal['submitted'];
            if ($isProposalSubmitted) {
                return $this->redirect(array('action' => 'view', $proposal['id']));
            }

            if ($this->request->is('post')) {
								$data = $this->request->getData()['data'];

								// $this->log('REQUEST_DATA: ' . var_export($this->request->getData(), TRUE));

								$cur_id = $this->request->getData()['Curriculum'][0]['curriculum_id'];

								if (array_key_exists('ChosenExam', $data))
								    $patch_data['chosen_exams'] = $data['ChosenExam'];
							  if (array_key_exists('ChosenFreeChoiceExam', $data))
								    $patch_data['chosen_free_choice_exams'] = $data['ChosenFreeChoiceExam'];

								// $this->log('PATCH_DATA: ' . var_export($patch_data, TRUE));

							  $proposal = $this->Proposals->patchEntity($proposal, $patch_data);

								$proposal['approved'] = false;
								$proposal['submitted'] = true;
								$proposal['frozen'] = false;
								$proposal['curriculum'] = [ $this->Proposals->Curricula->get($cur_id) ];

								$this->log('PROPOSAL: ' . var_export($proposal, TRUE));
								// return;

                if ($this->Proposals->save($proposal)) {
                    return $this->redirect(array('action' => 'view', $proposal['id']));
                }
								else {
									  $this->Flash->error(Utils::error_to_string($proposal->errors()));
		                return $this->redirect(array('action' => 'view', $proposal['id']));
								}
            }

            $this->set('curricula', $this->Proposals->Curricula->find('list'));
            $this->set('owner', $owner);
        } else {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }
    }

    public function adminReview ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $proposal = $this->Proposals->findById($id)
            ->contain([ 'Users', 'Curricula', 'ChosenExams', 'ChosenFreeChoiceExams' ])
            ->firstOrFail();
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');
        $exams = $exams_table->find('all', array(
            'recursive' => -1
        ));

        $this->set('proposal', $proposal);
        $this->set('exams', $exams);
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
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
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
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
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
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
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
            array(
                'controller' => 'proposals',
                'action' => 'admin_frozen'
            )
        );
    }

}

?>
