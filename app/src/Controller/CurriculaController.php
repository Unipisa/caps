<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;

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
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        $curricula = $this->Curriculum->find('all', array(
            'recursive' => -1
        ));
        $this->set('curricula', $curricula);
    }

    /**
     * @brief Get a single curriculum in JSON format. URL: caps/curricula/view/id.json
     */
    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curricula->findById($id)->contain([ 'FreeChoiceExams', 'CompulsoryGroups', 'CompulsoryExams' ])->firstOrFail();
        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }
        unset($curriculum['Proposal']);
        $this->set('curriculum', $curriculum);
        $this->set('_serialize', 'curriculum');
    }

    public function admin_add () {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is('post')) {
            $this->Curriculum->create();
            if ($this->Curriculum->save($this->request->data)) {
                $this->Session->setFlash(__('Curriculum creato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }

            $this->Session->setFlash(__('Errore: curriculum non creato.'));
        }
    }

    public function admin_edit ($id = null) {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curriculum->findById($id);
        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->Curriculum->save($this->request->data)) {
                $this->Session->setFlash(__('Curriculum aggiornato con successo.'));
                return $this->redirect(array('action' => 'admin_index'));
            }
            $this->Session->setFlash(__('Errore: curriculum non aggiornato.'));
        }

        $exams = $this->Exam->find('all', array(
            'recursive' => -1
        ));

        $groups = $this->Group->find('all', array(
            'recursive' => -1
        ));

        unset($curriculum['Proposal']);
        $this->set('curriculum', $curriculum);
        $this->set('exams', $exams);
        $this->set('groups', $groups);
        $this->set(
            'examsList',
            $this->Exam->find(
                'list',
                array(
                    'order' => array(
                        'Exam.name' => 'ASC'
                    )
                )
            )
        );
        $this->set('groupsList', $this->Group->find('list'));

        if (!$this->request->data) {
            $this->request->data = $curriculum;
        }
    }

    public function admin_delete ($id = null) {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $curriculum = $this->Curriculum->findById($id);
        if (!$curriculum) {
            throw new NotFoundException(__('Errore: curriculum non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->Curriculum->delete($id)) {
                $this->Session->setFlash(__('Curriculum cancellato con successo.'));
                return $this->redirect(
                    array(
                        'action' => 'admin_index'
                    )
                );
            }
        }

        $this->Session->setFlash(__('Error: curriculum non cancellato.'));
        $this->redirect(
            array(
                'action' => 'admin_index'
            )
        );
    }

}

?>
