<?php

App::uses('UnipiAuthenticate', 'Controller/Component/Auth');

class CompulsoryExamsController extends AppController {

    public $uses = array(
        'CompulsoryExam',
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
            $this->CompulsoryExam->create();

            if ($this->CompulsoryExam->save($this->request->data)) {
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

        $compulsory_exam = $this->CompulsoryExam->findById($id);
        if (!$compulsory_exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->CompulsoryExam->delete($id)) {
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
