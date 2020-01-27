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

    /**
     * @brief Get all curricula in JSON format. URL: caps/curricula.json
     */
    public function index () {
        $curricula = $this->Curricula->find('all');
        $this->set('curricula', $curricula);
        $this->set('_serialize', array('curricula'));
    }

    public function adminIndex () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $curricula = $this->Curricula->find('all');
        $this->set('curricula', $curricula);
        $this->set('owner', $user);
    }

    /**
     * @brief Get a single curriculum in JSON format. URL: caps/curricula/view/id.json
     */
    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)
            ->contain([ 'FreeChoiceExams', 'CompulsoryGroups', 'CompulsoryExams' ])
            ->firstOrFail();

        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        $this->set('curriculum', $curriculum);
        $this->set('_serialize', 'curriculum');
    }

    public function adminAdd () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is('post')) {
            $newcurriculum = $this->Curricula->newEntity();
            $newcurriculum = $this->Curricula->patchEntity($newcurriculum, $this->request->getData());
            if ($this->Curricula->save($newcurriculum)) {
                $this->Flash->success(__('Curriculum creato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }

            $this->Flash->error(Utils::error_to_string($newcurriculum->errors()));
        }

        $this->set('owner', $user);
    }

    public function adminEdit ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)
            ->contain([ 'CompulsoryExams', 'CompulsoryGroups', 'FreeChoiceExams' ])
            ->firstOrFail();

        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            $curriculum = $this->Curricula->patchEntity($curriculum, $this->request->getData());
            if ($this->Curricula->save($curriculum)) {
                $this->Flash->success(__('Curriculum aggiornato con successo.'));
                return $this->redirect(array('action' => 'admin_index'));
            }
            $this->Flash->error(__('Errore: curriculum non aggiornato.'));
        }

        $exams_table = TableRegistry::getTableLocator()->get('Exams');
        $groups_table = TableRegistry::getTableLocator()->get('Groups');

        $exams = $exams_table->find('all');
        $groups = $groups_table->find('all');

        $this->set('curriculum', $curriculum);
        $this->set('exams', $exams);
        $this->set('groups', $groups);
        $this->set('owner', $user);
        $this->set(
            'examsList',
            $exams_table->find(
                'list',
                array(
                    'order' => array(
                        'Exams.name' => 'ASC'
                    )
                )
            )
        );
        $this->set('groupsList', $groups_table->find('list'));

        if (! $this->request->getData('curriculum')) {
            $this->set(compact('curriculum'));
            // $this->request->data = $curriculum;
        }
    }

    public function adminDelete ($id = null) {
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

        if ($this->request->is(array('post', 'put'))) {
            if ($this->Curricula->delete($curriculum)) {
                $this->Flash->success(__('Curriculum cancellato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }
        }

        $this->Flash->error(__('Error: curriculum non cancellato.'));
        $this->redirect(
            array(
                'action' => 'admin_index'
            )
        );
    }

}

?>
