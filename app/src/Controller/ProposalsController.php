<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;

class ProposalsController extends AppController {

    public function initialize()
    {
        parent::initialize();

        $this->loadComponent('RequestHandler');
        $this->loadComponent('Paginator');
    }

    public $uses = array(
        'ChosenExam',
        'ChosenFreeChoiceExam',
        'Exam',
        'User',
        'Proposal'
    );

    private function done()
    {
        return $this->Proposals->find()->contain('Users')
            ->where([ 'Proposals.approved' => true, 'Proposals.frozen' => false ])
            ->limit(25)
            ->order('Users.name', 'asc'); // FIXME: Originally, the data was ordered by surname
    }

    private function todo()
    {
        return $this->Proposals->find()->contain('Users')
            ->where([
                'submitted' => true,
                'approved' => false
            ])
            ->limit(25)
            ->order('Users.name', 'asc'); // FIXME: Originally, the data was ordered by surname
    }

    private function frozen()
    {
        return $this->Proposals->find()->contain('Users')
            ->where([ 'Proposals.frozen' => true ])
            ->limit(25)
            ->order('Users.name', 'asc'); // FIXME: Originally, the data was ordered by surname
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

        $proposal = $this->Proposals->findById($id)->firstOrFail();
        if (!$proposal) {
            throw new NotFoundException('');
        }

        $users_table = TableRegistry::getTableLocator()->get('Users');
        $local_user = $users_table->find()
            ->where([ 'name' => $user['name'] ])
            ->firstOrFail();

        if ($local_user->id != $proposal->user_id) {
            throw new ForbiddenException(__(''));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');

        $exams = $exams_table->find('all', [
            'recursive' => -1
        ]);

        $this->set('proposal', $proposal);
        $this->set('exams', $exams);
    }

    public function add () {
	    $user = $this->Auth->user();

        $username = $user['user'];
        $owner = $this->User->find('first', array(
            'conditions' => array('User.username' => $username)
        ));

        if ($owner) {
            $proposal = $owner['Proposal'];
            $proposalId = $proposal['id'];

            $isProposalSubmitted = $proposal['submitted'];
            if ($isProposalSubmitted) {
                return $this->redirect(array('action' => 'view', $proposalId));
            }

            if ($this->request->is('post')) {
                $this->request->data['Proposal'] = $proposal;
                $this->request->data['Proposal']['approved'] = false;
                $this->request->data['Proposal']['submitted'] = true;
                $this->request->data['Proposal']['frozen'] = false;
                unset($this->Proposal->ChosenExam->validate['proposal_id']);
                unset($this->Proposal->ChosenFreeChoiceExam->validate['proposal_id']);
                if ($this->Proposal->saveAssociated($this->request->data)) {
                    return $this->redirect(array('action' => 'view', $proposalId));
                }
            }

            $this->set('curricula', $this->Proposal->Curriculum->find('list'));
            $this->set('owner', $owner);
        } else {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }
    }

    public function admin_review ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $proposal = $this->Proposal->findById($id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $exams = $this->Exam->find('all', array(
            'recursive' => -1
        ));

        $this->set('proposal', $proposal);
        $this->set('exams', $exams);
    }

    public function admin_approve ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposal->read(null, $id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['Proposal']['approved'] = true;
        $this->Proposal->save($proposal);

        return $this->redirect(
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
        );
    }

    public function admin_reject ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposal->read(null, $id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        foreach ($proposal['ChosenExam'] as $chosenExam):
            $this->ChosenExam->delete($chosenExam['id']);
        endforeach;

        foreach ($proposal['ChosenFreeChoiceExam'] as $chosenFreeChoiceExam):
            $this->ChosenFreeChoiceExam->delete($chosenFreeChoiceExam['id']);
        endforeach;

        $proposal['Proposal']['submitted'] = false;
        $proposal['Proposal']['approved'] = false;
        $proposal['Proposal']['frozen'] = false;
        $this->Proposal->save($proposal);

        return $this->redirect(
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
        );
    }

    public function admin_freeze ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposal->read(null, $id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['Proposal']['frozen'] = true;
        $this->Proposal->save($proposal);

        return $this->redirect(
            array(
                'controller' => 'proposals',
                'action' => 'admin_todo'
            )
        );
    }

    public function admin_thaw ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Errore: id non valido.'));
        }

        $proposal = $this->Proposal->read(null, $id);
        if (!$proposal) {
            throw new NotFoundException(__('Errore: il piano richiesto non esiste.'));
        }

        $proposal['Proposal']['frozen'] = false;
        $this->Proposal->save($proposal);

        return $this->redirect(
            array(
                'controller' => 'proposals',
                'action' => 'admin_frozen'
            )
        );
    }

}

?>
