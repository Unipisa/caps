<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;
use App\Form\CurriculaFilterForm;

class CurriculaController extends AppController {

    public $paginate = [
        'contain' => [ 'Degrees' ],
        'sortWhitelist' => [ 'academic_year', 'name', 'Degrees.name' ],
        'limit' => 25,
        'order' => [
            'academic_year' => 'desc'
        ]
    ];

    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('Paginator');
        $this->loadComponent('RequestHandler');
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index () {
        $curricula = $this->Curricula->find('all')
            ->contain([ 'Degrees']);

        $filterForm = new CurriculaFilterForm($curricula);
        $filterData = $this->request->getQuery();
        if (!key_exists('academic_year', $filterData) || !$filterForm->validate($filterData)) {
          // no filter form provided or data not valid: set defaults:
          $filterData = [
            'name' => '',
            'academic_year' => '',
            'degree' => ''
          ];
        }
        $curricula = $filterForm->execute($filterData);
        $this->set('filterForm', $filterForm);

        $this->set('curricula', $curricula);
        $this->set('_serialize', [ 'curricula' ]);
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
            if ($this->request->getData('clone')) {
                $year = intval($this->request->getData('year'));

                if ($year <= 0) {
                    $this->Flash->error('Anno non valido specificato');
                    return;
                }

                foreach ($selected as $curriculum_id) {
                    $curriculum = $this->Curricula
                        ->findById($curriculum_id)
                        ->contain([ 'CompulsoryGroups', 'CompulsoryExams', 'FreeChoiceExams' ])
                        ->firstOrFail();

                    // We set the id and the id of all the children entities to null, so that a call to save will
                    // automatically create new entities.
                    $curriculum['id'] = null;
                    $curriculum->isNew(true);
                    $curriculum['academic_year'] = $year;

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

                    if (! $this->Curricula->save($curriculum)) {
                        $this->Flash->error('Impossibile duplicare il curriculum: ' + $curriculum['name']);
                        return $this->redirect([ 'action' => 'index' ]);
                    }
                }
                // debug($selected);
                $this->Flash->success('Curricula correttamente duplicati');
                return $this->redirect(['action' => 'index']);
            } else if ($this->request->getData('delete')) {
                $delete_count = 0;
                foreach($selected as $curriculum_id) {
                    if ($this->deleteIfNotUsed($curriculum_id)) {
                        $delete_count ++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} curricula cancellati con successo', ['delete_count' => $delete_count]));
                } else if ($delete_count == 1) {
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
    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)
            ->contain([
              'FreeChoiceExams', 'CompulsoryGroups' => ['Groups'],
              'CompulsoryExams' => ['Exams'], 'Degrees' ])
            ->firstOrFail();

        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        $this->set('curriculum', $curriculum);
        $this->set('_serialize', 'curriculum');
    }

    public function edit ($id = null) {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) {
            $curriculum = $this->Curricula->findById($id)
                ->contain([ 'CompulsoryExams', 'CompulsoryGroups', 'FreeChoiceExams', 'Degrees' ])
                ->firstOrFail();
            if (!$curriculum) {
              throw new NotFoundException(__('Errore: curriculum non esistente.'));
            }
            $success_message = __('Curriculum aggiornato con successo.');
        } else {
            $curriculum = $this->Curricula->newEntity();
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
                return $this->redirect(['action' => 'edit', $curriculum['id']]);
            }
            else {
                $this->Flash->error(__('Errore: curriculum non aggiornato.'));
                $this->Flash->error(Utils::error_to_string($curriculum->errors()));
            }
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');
        $groups_table = TableRegistry::getTableLocator()->get('Groups');

        $exams = $exams_table->find('all');
        $groups = $groups_table->find('all');

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
        $this->set('groupsList', $groups_table->find('list'));

        if (! $this->request->getData('curriculum')) {
            $this->set(compact('curriculum'));
            // $this->request->data = $curriculum;
        }
    }

    public function delete ($id = null) {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Curriculum cancellato con successo.'));
        }
        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($curriculum_id) {
        $curriculum = $this->Curricula->findById($curriculum_id)->firstOrFail();
        $proposal_count = TableRegistry::getTableLocator()->get('Proposals')->find('all')
            ->where(['curriculum_id' => $curriculum_id])
            ->count();
        if ($proposal_count == 0) {
            if ($this->Curricula->delete($curriculum)) {
                return True;
            } else {
                $this->flash->error(__('Cancellazione del curriculum non riuscita'));
            }
        } else {
            $this->Flash->error(__('Il curriculum {name} {year} non può essere rimosso perché ci sono {count} piani di studio collegati',
            ['name' => $curriculum['name'], 'year' => $curriculum['year'], 'count' => $proposal_count]));
        }
        return False;
    }
}

?>
