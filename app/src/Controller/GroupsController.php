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
        $groups = $this->Groups->find('all')->contain([ 'Exams' ]);

        $this->set('groups', $groups);
        $this->set('_serialize', array('groups'));
    }

    public function adminIndex () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $groups = $this->Groups->find('all');
        $this->set('groups', $groups);
        $this->set('owner', $user);
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

    public function adminAdd () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is('post')) {
            $newgroup = $this->Groups->newEntity();
            $newgroup = $this->Groups->patchEntity($newgroup, $this->request->data);
            if ($this->Groups->save($newgroup)) {
                $this->Flash->success(__('Gruppo creato con successo.'));
                return $this->redirect(array('action' => 'adminIndex'));
            }
            $this->Flash(__('Errore: gruppo non creato.'));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');

        $this->set(
            'exams',
            $exams_table->find(
                'list',
                array(
                    'order' => array(
                        'Exams.name' => 'ASC'
                    )
                )
            )
        );

        $this->set('owner', $user);
    }

    public function adminEdit($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $group= $this->Groups->findById($id)->contain([ 'Exams' ])->firstOrFail();
        if (!$group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            $group = $this->Groups->patchEntity($group, $this->request->data);
            if ($this->Groups->save($group)) {
                $this->Flash->success(__('Gruppo aggiornato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }

            $this->Flash->error(__('Errore: gruppo non aggiornato.'));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');

        if (!$this->request->data) {
            $this->request->data = $group;
            $this->set('group', $group);
            $this->set(
                'exams',
                 $exams_table->find(
                    'list',
                    array(
                        'order' => array(
                            'Exams.name' => 'ASC'
                        )
                    )
                )
            );
        }

        $this->set('owner', $user);
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

        if ($this->request->is(array('post', 'put'))) {
            if ($this->Groups->delete($group)) {
                $this->Flash->success(__('Gruppo cancellato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }
        }

        $this->Flash->error(__('Error: gruppo non cancellato.'));
        $this->redirect(
            array(
                'action' => 'admin_index'
            )
        );
    }

}

?>
