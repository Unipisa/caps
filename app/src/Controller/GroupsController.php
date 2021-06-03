<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */


namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use App\Model\Entity\Group;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use App\Form\GroupsFilterForm;

class GroupsController extends AppController
{
    public $paginate = [
        'contain' => [ 'Degrees' ],
        'sortWhitelist' => [ 'Degrees.academic_year', 'name', 'Degrees.name' ],
        'limit' => 10,
        'order' => [
            'Degrees.academic_year' => 'desc'
        ]
    ];

    public function initialize(): void
    {
        parent::initialize();
    }

    public function beforeFilter(\Cake\Event\EventInterface $event)
    {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index()
    {
        $groups = $this->Groups->find('all')->contain([ 
            'Exams' => function ($q) {
                return $q->order([ 'Exams.name' => 'asc' ]);
                },
            'Degrees' 
            ]);
        
        $filterForm = new GroupsFilterForm($groups);
        $groups = $filterForm->validate_and_execute($this->request->getQuery());
        $this->set('filterForm', $filterForm);
        $this->set('groups', $groups);
        $this->set('_serialize', ['groups']); // overwritten below if CSV is requested
        $this->set('paginated_groups', $this->paginate($groups->cleanCopy()));

        if ($this->request->is('csv')) {
            $data = [];
            foreach ($groups as $group) {
                $exams = $group->exams;
                $bare_group = $group;
                unset($bare_group->exams);
                foreach ($exams as $exam) {
                    $data[] = ['group' => $bare_group, 'exam' => $exam];
                }
            }
            $this->set('data', $data);
            $this->set('_serialize', 'data');
        } 
        
        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }

            $selected = $this->request->getData('selection');
            if (!$selected) {
                $this->Flash->error(__('nessun gruppo selezionato'));

                return $this->redirect(['action' => 'index']);
            }
            if ($this->request->getData('delete')) {

                $delete_count = 0;
                foreach ($selected as $group_id) {
                    if ($this->deleteIfNotUsed($group_id)) {
                        $delete_count++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} gruppi cancellati con successo', ['delete_count' => $delete_count]));
                } elseif ($delete_count == 1) {
                    $this->Flash->success(__('gruppo cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun gruppo cancellato'));
                }

                return $this->redirect(['action' => 'index']);
            }
        }

    }

    public function view($id = null)
    {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $group = $this->Groups->findById($id)->contain([ 'Exams', 'Degrees' ])->firstOrFail();
        if (!$group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }
        $this->set('group', $group);
        $this->set('_serialize', 'group');
    }

    public function edit($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) {
            $group = $this->Groups->findById($id)->contain([ 'Exams', 'Degrees' ])->firstOrFail();
            if (!$group) {
                throw new NotFoundException(__('Errore: gruppo non esistente.'));
            }
            $success_message = __('Gruppo aggiornato con successo.');
            $failure_message = __('Errore: gruppo non aggiornato.');
        } else {
            $group = new Group();
            $success_message = __('Gruppo creato con successo.');
            $failure_message = __('Errore: gruppo non creato.');
        }

        if ($this->request->is(['post', 'put'])) {
            $group = $this->Groups->patchEntity($group, $this->request->getData());
            if ($group = $this->Groups->save($group)) {
                $this->Flash->success($success_message);
                return $this->redirect(['action' => 'view', $group->id]);
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
        $this->set('degrees', $this->Groups->Degrees->find(
            'list',
            ['order' => ['Degrees.academic_year' => 'DESC']]));
    }

    public function delete($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Gruppo cancellato con successo.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($group_id)
    {
        $group = $this->Groups->findById($group_id)->firstOrFail();
        $use_count = 0;
        foreach (['compulsory_groups'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['group_id' => $group_id])
                ->count();
        }
        if ($use_count > 0) {
            $this->Flash->error(__(
                'Il gruppo {name} non può essere rimosso perché viene utilizzato {count} volte.',
                ['name' => $group['name'], 'count' => $use_count]
            ));

            return false;
        }
        if (!$this->Groups->delete($group)) {
            $this->Flash->error(__('Cancellazione non riuscita'));

            return false;
        }

        return true;
    }
}