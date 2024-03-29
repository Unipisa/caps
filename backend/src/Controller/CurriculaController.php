<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
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

use App\Model\Entity\Curriculum;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;
use App\Form\CurriculaFilterForm;
use Cake\Http\Exception\NotFoundException;

class CurriculaController extends AppController
{
    public $paginate = [
        'contain' => [ 'Degrees' ],
        'sortableFields' => [ 'Degrees.academic_year', 'name', 'Degrees.name' ],
        'limit' => 10,
        'order' => [
            'Degrees.academic_year' => 'desc',
            'Degrees.name' => 'asc',
            'Curricula.id' => 'asc'
        ]
    ];

    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('Paginator');
        $this->loadComponent('RequestHandler');
    }

    public function beforeFilter(\Cake\Event\EventInterface $event)
    {
        parent::beforeFilter($event);
    }

    public function index()
    {
        $curricula = $this->Curricula->find('all')
            ->contain([ 'Degrees']);

        $filterForm = new CurriculaFilterForm($curricula);
        $curricula = $filterForm->validate_and_execute($this->request->getQuery());
        $this->set('filterForm', $filterForm);

        $this->set('curricula', $curricula);
        $this->viewBuilder()->setOption('serialize', [ 'curricula' ]);
        $this->set('paginated_curricula', $this->paginate($curricula->cleanCopy()));

        if ($this->request->is(['post', 'put'])) {
            // azioni sulla selezione
            // clone / delete
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }
            $selected = $this->request->getData('selection');
            if (!$selected) {
                $this->Flash->error(__('nessun curriculum selezionato'));

                return $this->redirect(['action' => 'index']);
            }
            if ($this->request->getData('delete')) {
                $delete_count = 0;
                foreach ($selected as $curriculum_id) {
                    if ($this->deleteIfNotUsed($curriculum_id)) {
                        $delete_count++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} curricula cancellati con successo', ['delete_count' => $delete_count]));
                } elseif ($delete_count == 1) {
                    $this->Flash->success(__('un curriculum cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun curriculum cancellato'));
                }

                return $this->redirect(['action' => 'index']);
            }
        }
    }

    /**
     * @brief Get a single curriculum
     */
    public function view($id = null)
    {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)
            ->contain([
              'FreeChoiceExams', 'CompulsoryGroups' => ['Groups'],
              'CompulsoryExams' => ['Exams'], 
              'FreeChoiceExams' => [ 'Groups' ], 'Degrees' ])
            ->firstOrFail();

        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        $this->set('curriculum', $curriculum);
        $this->viewBuilder()->setOption('serialize', 'curriculum');
    }

    public function edit($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) {
            $curriculum = $this->Curricula->findById($id)
                ->contain([ 'CompulsoryExams', 'CompulsoryGroups', 'FreeChoiceExams' => ['Groups'], 'Degrees' ])
                ->firstOrFail();
            if (!$curriculum) {
                throw new NotFoundException(__('Errore: curriculum non esistente.'));
            }
            $success_message = __('Curriculum aggiornato con successo.');
        } else {
            $curriculum = new Curriculum();
            $success_message = __('Curriculum creato con successo: aggiungere gli obblighi');
            $curriculum['compulsory_exams'] = [];
            $curriculum['compulsory_groups'] = [];
            $curriculum['free_choice_exams'] = [];
            $curriculum['degrees'] = [];
        }

        if ($this->request->is(['post', 'put'])) {
            $curriculum = $this->Curricula->patchEntity($curriculum, $this->request->getData());

            if ($this->Curricula->save($curriculum)) {
                $this->Flash->success($success_message);

                return $this->redirect(['action' => 'view', $curriculum['id']]);
            } else {
                $this->Flash->error(__('Errore: curriculum non aggiornato.'));
                $this->Flash->error(Utils::error_to_string($curriculum->errors()));
            }
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');
        $groups_table = TableRegistry::getTableLocator()->get('Groups');

        $exams = $exams_table->find('all');

        if ($curriculum['degree_id']) {
            $groups = $groups_table->find('all', [
                'conditions' => [
                    'Groups.degree_id' => $curriculum['degree_id']],
                'contains' => ['Degrees']]);
        }
        else {
            $groups = [];
        }

        $this->set('curriculum', $curriculum);
        $this->set('exams', $exams);
        $this->set('degrees', $this->Curricula->Degrees->find('list'));
        $this->set('groups', $groups);
        $this->set(
            'examsList',
            $exams_table->find(
                'list',
                ['order' => ['Exams.name' => 'ASC']]
            )
        );

        if ($curriculum['degree_id']) {
            $this->set('groupsList', $groups_table->find('list',
                ['conditions' => ['Groups.degree_id' => $curriculum['degree_id']]]
            ));
        }

        if (! $this->request->getData('curriculum')) {
            $this->set(compact('curriculum'));
            // $this->request->data = $curriculum;
        }
    }

    public function delete($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Curriculum cancellato con successo.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($curriculum_id)
    {
        $curriculum = $this->Curricula->findById($curriculum_id)->firstOrFail();
        $proposal_count = TableRegistry::getTableLocator()->get('Proposals')->find('all')
            ->where(['curriculum_id' => $curriculum_id])
            ->count();
        if ($proposal_count == 0) {
            if ($this->Curricula->delete($curriculum)) {
                return true;
            } else {
                $this->flash->error(__('Cancellazione del curriculum non riuscita'));
            }
        } else {
            $this->Flash->error(__(
                'Il curriculum {name} {year} non può essere rimosso perché ci sono {count} piani di studio collegati',
                ['name' => $curriculum['name'], 'year' => $curriculum['year'], 'count' => $proposal_count]
            ));
        }

        return false;
    }
}