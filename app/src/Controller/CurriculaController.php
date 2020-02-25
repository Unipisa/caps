<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;

class CurriculaController extends AppController {

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
        $this->set('curricula', $curricula);
        $this->set('_serialize', [ 'curricula' ]);

        if ($this->request->is(['post', 'put'])) {
            // azioni sulla selezione
            // clone / delete
            $user = $this->Auth->user();
            if (!$user['admin']) {
                throw new ForbiddenException();
            }
            $selected = $this->request->getData('selection');
            if (!$selected) {
                $this->Flash->error(__('nessun curriculum selezionato'));
                return $this->redirect(['action' => 'index']);
            }
            if ($this->request->getData('clone')) {
                debug($selected);
                $this->Flash->error('duplica: non ancora implementato');
            } else if ($this->request->getData('delete')) {
                $delete_count = 0;
                foreach($selected as $curriculum_id) {
                    $curriculum = $this->Curricula->findById($curriculum_id)->firstOrFail();
                    $proposal_count = TableRegistry::getTableLocator()->get('Proposals')->find('all')
                        ->where(['curriculum_id' => $curriculum_id])
                        ->count();
                    if ($proposal_count == 0) {
                        if ($this->Curricula->delete($curriculum)) {
                            $delete_count ++;
                        }
                    } else {
                        $this->Flash->error(__('Il curriculum {name} {year} non può essere rimosso perché ci sono {count} piani di studio collegati',
                        ['name' => $curriculum['name'], 'year' => $curriculum['year'], 'count' => $proposal_count]));
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
        $user = $this->Auth->user();
        if (!$user['admin']) {
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
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)->firstOrFail();

        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        if ($this->request->is(['post', 'put'])) {
            if ($this->Curricula->delete($curriculum)) {
                $this->Flash->success(__('Curriculum cancellato con successo.'));
                return $this->redirect(
                    ['action' => 'index']
                );
            }
        }

        $this->Flash->error(__('Error: curriculum non cancellato.'));
        $this->redirect(
            ['action' => 'index']
        );
    }

}

?>
