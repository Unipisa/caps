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

use App\Controller\AppController;
use App\Model\Entity\Degree;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Form\DegreesFilterForm;

/**
 * Degrees Controller
 *
 * @property \App\Model\Table\DegreesTable $Degrees
 *
 * @method \App\Model\Entity\Degree[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class DegreesController extends AppController
{
    public $paginate = [
//        'contain' => [ 'Degrees' ],
        'sortWhitelist' => [ 'academic_year', 'name' ],
        'limit' => 10,
        'order' => [
            'academic_year' => 'desc'
        ]
    ];

    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $degrees = $this->Degrees->find();

        $filterForm = new DegreesFilterForm($degrees);
        $degrees = $filterForm->validate_and_execute($this->request->getQuery());
        $this->set('filterForm', $filterForm);

        $this->set('degrees', $degrees);
        $this->set('_serialize', [ 'degrees' ]);
        $this->set('paginated_degrees', $this->paginate($degrees->cleanCopy()));

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }
            
            $selected = $this->request->getData('selection');
            if (!$selected) {
                $this->Flash->error(__('nessun corso selezionato'));

                return $this->redirect(['action' => 'index']);
            }

            if ($this->request->getData('delete')) {
                $delete_count = 0;
                foreach ($selected as $degree_id) {
                    if ($this->deleteIfNotUsed($degree_id)) {
                        $delete_count++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} corsi cancellati con successo', ['delete_count' => $delete_count]));
                } elseif ($delete_count == 1) {
                    $this->Flash->success(__('corso cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun corso cancellato'));
                }

                return $this->redirect(['action' => 'index']);
            } else if ($this->request->getData('clone')) {
                $year = intval($this->request->getData('year'));

                if ($year <= 0) {
                    $this->Flash->error('Anno non valido specificato');
                    return;
                }

                $CompulsoryGroups = TableRegistry::getTableLocator()->get('CompulsoryGroups');
                $FreeChoiceExams = TableRegistry::getTableLocator()->get('FreeChoiceExams');

                foreach ($selected as $degree_id) {
                    $degree = $this->Degrees
                        ->findById($degree_id)
                        ->contain([
                            'Curricula' => ['CompulsoryGroups', 'CompulsoryExams', 'FreeChoiceExams'],
                            'Groups' => ['Exams']])
                        ->firstOrFail();
                    // We set the id and the id of all the children entities to null, so that a call to save will
                    // automatically create new entities.
                    $degree['id'] = null;
                    $degree['academic_year'] = $year;
                    $degree['enabled'] = false;
                    $degree->isNew(true);

                    foreach ($degree['curricula'] as $curriculum) {   
                        $curriculum['id'] = null;
                        $curriculum->isNew(true);

                        foreach ($curriculum['compulsory_groups'] as $cg) {
                            $cg['id'] = null;
                            $cg->isNew(true);
                        }
                        foreach ($curriculum['compulsory_exams'] as $ce) {
                            $ce['id'] = null;
                            $ce->isNew(true);
                        }
                        foreach ($curriculum['free_choice_exams'] as $fce) {
                            $fce['id'] = null;
                            $fce->isNew(true);
                        }

                    }

                    foreach($degree['groups'] as $group) {
                        $group['old_id'] = $group['id'];
                        $group['id'] = null;
                        $group->isNew(true);
                    }

                    if (! $this->Degrees->save($degree)) {
                        $this->Flash->error('Impossibile duplicare il corso: ' . $degree['name']);
                        return $this->redirect([ 'action' => 'index' ]);
                    }

                    // create mapping from old groups to new ones
                    $map = [];
                    foreach($degree['groups'] as $group) {
                        $map[$group['old_id']] = $group['id'];
                    }

                    // assegna i gruppi nuovi ai curriculum nuovi
                    foreach($degree['curricula'] as $curriculum) {
                        foreach($curriculum['compulsory_groups'] as $item) {
                            if (array_key_exists($item['group_id'], $map)) {
                                $item['group_id'] = $map[$item['group_id']];
                            } else {
                                $this->Flash->error('esame a scelta non duplicato per incongruenza nel curriculum ' . $curriculum['name']);
                            }
                            if (!$CompulsoryGroups->save($item)) {
                                $this->Flash->error('Errore database (885746)');
                            }
                        }
                        foreach($curriculum['free_choice_exams'] as $item) {
                            if ($item['group_id'] != null) {
                                if (array_key_exists($item['group_id'], $map)) {
                                    $item['group_id'] = $map[$item['group_id']];
                                } else {
                                    $this->Flash->error('esame a scelta non duplicato per incongruenza nel curriculum ' . $curriculum['name']);
                                }
                            }
                            if (!$FreeChoiceExams->save($item)) {
                                $this->Flash->error('Errore database (948435)');
                            }
                        }
                    }
                }

                // debug($selected);
                $this->Flash->success('Corsi di Laurea duplicati');

                return $this->redirect(['action' => 'index']);
            }
        }

        $paginated_degrees = $this->paginate($degrees->cleanCopy());
        $this->set(compact('degrees', 'paginated_degrees'));
        $this->viewBuilder()->setOption('serialize', [ 'degrees' ]);
    }

    /**
     * View method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $degree = $this->Degrees->get($id, [
            'contain' => ['Curricula', 'Groups']
        ]);

        $this->set('degree', $degree);
        $this->set('_serialize', 'degree');
    }

    /**
     * Edit method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($id != null) {
            $degree = $this->Degrees->findById($id)->contain(['Groups'])->firstOrFail();
        } else {
            $degree = new Degree();
            // For new entities we set some reasonable default values in the text fields, to
            // give an indication to the user of what would be sensible to put there.
            if ($degree->isNew()) {
              $degree['approval_message'] = "Il piano di studi è stato approvato.";
              $degree['rejection_message'] = "Il piano di studi è stato rigettato.";
              $degree['submission_message'] = "Il piano di studi è stato correttamente sottomesso.";
            }
        }

        $groups_table = TableRegistry::getTableLocator()->get('Groups');
        $default_groups = $groups_table->find('list')
            ->contain('Degrees')
            ->where([ 'Groups.degree_id' => $degree['id'] ]);

        if ($this->request->is(['patch', 'post', 'put'])) {
            $degree = $this->Degrees->patchEntity($degree, $this->request->getData());

            if ($this->Degrees->save($degree)) {
                $this->Flash->success(__('Il corso di laurea è stato salvato'));
                return $this->redirect(['action' => 'view', $degree->id]);
            } else {
                $this->Flash->error(__('Impossibile salvare il corso di laurea'));
            }
        }
        $this->set(compact('degree', 'default_groups'));
    }

    /**
     * Delete method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Il corso di laurea è stato cancellato.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($degree_id)
    {
        $degree = $this->Degrees->findById($degree_id)->firstOrFail();
        $use_count = 0;
        foreach (['Curricula'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['degree_id' => $degree_id])
                ->count();
        }
        if ($use_count > 0) {
            $this->Flash->error(__(
                'Il corso {name} non può essere rimosso perché viene utilizzato {count} volte',
                ['name' => $degree['name'], 'count' => $use_count]
            ));

            return false;
        }
        if (!$this->Degrees->delete($degree)) {
            $this->Flash->error(__('Cancellazione non riuscita'));

            return false;
        }

        return true;
    }

    public function curricula($id) {
        $degree = $this->Degrees->get($id, [
            'contain' => ['Curricula']
        ]);

        $this->set('curricula', $degree['curricula']);
        $this->set('_serialize', [ 'curricula' ]);
    }
}