<?php

App::uses('UnipiAuthenticate', 'Controller/Component/Auth');

class CompulsoryGroupsController extends AppController {

    public $uses = array(
        'CompulsoryGroup'
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
            $this->CompulsoryGroup->create();

            if ($this->CompulsoryGroup->save($this->request->data)) {
                $this->Session->setFlash(__('Gruppo aggiunto con successo.'));
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

        $compulsory_group = $this->CompulsoryGroup->findById($id);
        if (!$compulsory_group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->CompulsoryGroup->delete($id)) {
                $this->Session->setFlash(__('Gruppo cancellato con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }
    
        $this->Session->setFlash(__('Error: gruppo non cancellato.'));
        $this->redirect(
            $this->request->referer()
        );
    }

}

?>
