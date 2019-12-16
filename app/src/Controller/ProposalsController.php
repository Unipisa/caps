<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;

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

    public $done = array(
        'conditions' => array(
            'Proposal.approved' => true,
            'Proposal.frozen' => false
        ),
        'limit' => 25,
        'order' => array(
            'User.surname' => 'asc'
        )
    );

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

    // La vecchia maniera di recuperare i dati è stata sostituita da quella nuova
    /* public $todo = array(
        'conditions' => array(
            'Proposal.submitted' => true,
            'Proposal.approved' => false
        ),
        'limit' => 25,
        'order' => array(
            'User.surname' => 'asc'
        )
    ); */

    public $frozen = array(
        'conditions' => array(
            'Proposal.frozen' => true
        ),
        'limit' => 25,
        'order' => array(
            'User.surname' => 'asc'
        )
    );

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminTodo () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        // $this->Paginator->settings = $this->todo;
        // $this->set('proposalsTodo', $this->Paginator->paginate('Proposal'));
        $this->set('proposalsTodo', $this->Paginator->paginate($this->todo()));
        $this->set('selected', 'todo');
    }

    public function admin_done () {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $this->Paginator->settings = $this->done;
        $this->set('proposalsApproved', $this->Paginator->paginate('Proposal'));
    }

    public function admin_frozen () {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $this->Paginator->settings = $this->frozen;
        $this->set('proposalsFrozen', $this->Paginator->paginate('Proposal'));
    }

    public function view ($id = null) {
        $user = AuthComponent::user();

        if (!$id) {
            throw new NotFoundException('ancora questo non lo abbiamo');
        }

        $proposal = $this->Proposal->findById($id);
        if (!$proposal) {
            throw new NotFoundException('');
        }

        if ($user['user'] != $proposal['User']['username']) {
            throw new ForbiddenException(__(''));
        }

        $exams = $this->Exam->find('all', array(
            'recursive' => -1
        ));

        $this->set('proposal', $proposal);
        $this->set('exams', $exams);
    }

    public function add () {
	    $user = AuthComponent::user();

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
        $user = AuthComponent::user();
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
        $user = AuthComponent::user();
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
        $user = AuthComponent::user();
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
        $user = AuthComponent::user();
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
        $user = AuthComponent::user();
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
