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

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }

            if ($this->request->getData('delete')) {
                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun gruppo selezionato'));
                    return $this->redirect(['action' => 'index']);
                }

                $delete_count = 0;
                foreach($selected as $group_id) {
                    if ($this->deleteIfNotUsed($group_id)) {
                        $delete_count ++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} gruppi cancellati con successo', ['delete_count' => $delete_count]));
                } else if ($delete_count == 1) {
                    $this->Flash->success(__('gruppo cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun gruppo cancellato'));
                }
                return $this->redirect(['action' => 'index']);
            }
        }

        $this->set('groups', $groups);
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
        if (!$this->user['admin']) {
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

    public function delete ($id = null) {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Gruppo cancellato con successo.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($group_id) {
        $group = $this->Groups->findById($group_id)->firstOrFail();
        $use_count = 0;
        foreach(['exams_groups', 'compulsory_groups'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['group_id' => $group_id])
                ->count();
        }
        if ($use_count>0) {
            $this->Flash->error(__('Il gruppo {name} non può essere rimosso perché viene utilizzato {count} volte.',
            ['name' => $group['name'], 'count' => $use_count]));
            return False;
        }
        if (!$this->Groups->delete($group)) {
            $this->Flash->error(__('Cancellazione non riuscita'));
            return False;
        }
        return True;
    }

}

?>
