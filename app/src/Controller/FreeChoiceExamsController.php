<?php

App::uses('UnipiAuthenticate', 'Controller/Component/Auth');

class FreeChoiceExamsController extends AppController {

    public $uses = array(
        'FreeChoiceExam',
    );

    public function beforeFilter () {
        parent::beforeFilter();
        $this->Auth->deny();
    }

    public function admin_add () {
        $user = AuthComponent::user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is(array('post', 'put'))) {
            $this->FreeChoiceExam->create();

            if ($this->FreeChoiceExam->save($this->request->data)) {
                $this->Session->setFlash(__('Esame aggiunto con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
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

        $free_choice_exam = $this->FreeChoiceExam->findById($id);
        if (!$free_choice_exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->FreeChoiceExam->delete($id)) {
                $this->Session->setFlash(__('Esame cancellato con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }
    
        $this->Session->setFlash(__('Error: esame non cancellato.'));
        $this->redirect(
            $this->request->referer()
        );
    }

}

?>
