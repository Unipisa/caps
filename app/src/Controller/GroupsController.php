<?php


namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;

class GroupsController extends AppController {

   public function initialize()
    {
        parent::initialize();

        $this->loadComponent('RequestHandler');
        $this->loadComponent('Flash');
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index () {
        $user = $this->Auth->user();
        $groups = $this->Groups->find('all')->contain([ 'Exams' ]);
        $this->set('groups', $groups);
        $this->set('owner', $user);
        $this->set('_serialize', ['groups']);
    }

    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $group = $this->Groups->findById($id)->contain([ 'Exams' ])->firstOrFail();
        if (!$group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }
        $this->set('group', $group);
        $this->set('_serialize', 'group');
    }

    public function edit($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) {
            $group = $this->Groups->findById($id)->contain([ 'Exams' ])->firstOrFail();
            if (!$group) {
                throw new NotFoundException(__('Errore: gruppo non esistente.'));
            }
            $success_message = __('Gruppo aggiornato con successo.');
            $failure_message = __('Errore: gruppo non aggiornato.');
        } else {
            $group = $this->Groups->newEntity();
            $success_message = __('Gruppo creato con successo.');
            $failure_message = __('Errore: gruppo non creato.');
        }

        if ($this->request->is(['post', 'put'])) {
            $group = $this->Groups->patchEntity($group, $this->request->getData());
            if ($this->Groups->save($group)) {
                $this->Flash->success($success_message);
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash($failure_message);
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');

        $this->set('group', $group);
        $this->set(
            'exams',
             $exams_table->find(
                'list',
                ['order' => ['Exams.name' => 'ASC']]
            )
        );
    }

    public function adminDelete ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $group= $this->Groups->findById($id)->firstOrFail();
        if (!$group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }

        if ($this->request->is(['post', 'put'])) {
            if ($this->Groups->delete($group)) {
                $this->Flash->success(__('Gruppo cancellato con successo.'));
                return $this->redirect(
                    ['action' => 'index']
                );
            }
        }

        $this->Flash->error(__('Error: gruppo non cancellato.'));
        $this->redirect(
            ['action' => 'index']
        );
    }

}

?>
