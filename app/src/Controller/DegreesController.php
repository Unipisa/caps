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

        $this->set('data', $degrees);  // obsolete... can be removed?
        $this->set('degrees', $degrees);
        $this->set('_serialize', 'data'); // TODO: dovrebbe essere: $this->set('_serialize', [ 'data' ]); 
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
                        $group['id'] = null;
                        $group->isNew(true);
                    }
                }
                if (! $this->Degrees->save($degree)) {
                    $this->Flash->error('Impossibile duplicare il corso: ' + $degree['name']);
                    return $this->redirect([ 'action' => 'index' ]);
                }

                // debug($selected);
                $this->Flash->success('Corsi duplicati correttamente');

                return $this->redirect(['action' => 'index']);
            }
        }
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
            'contain' => ['Curricula']
        ]);

        $this->set('degree', $degree);
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
        if ($id != null) {
            $degree = $this->Degrees->get($id);
        } else {
            $degree = $this->Degrees->newEntity();
            // For new entities we set some reasonable default values in the text fields, to
            // give an indication to the user of what would be sensible to put there.
            if ($degree->isNew()) {
              $degree['approval_message'] = "Il piano di studi è stato approvato.";
              $degree['rejection_message'] = "Il piano di studi è stato rigettato.";
              $degree['submission_message'] = "Il piano di studi è stato correttamente sottomesso.";
            }
        }

        if ($this->request->is(['patch', 'post', 'put'])) {
            $degree = $this->Degrees->patchEntity($degree, $this->request->getData());

            if ($this->Degrees->save($degree)) {
                $this->Flash->success(__('Il corso di laurea è stato salvato'));
                return $this->redirect(['action' => 'view', $degree->id]);
            } else {
                $this->Flash->error(__('Impossibile salvare il corso di laurea'));
            }
        }

        $this->set(compact('degree'));
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
}