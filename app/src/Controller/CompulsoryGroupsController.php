<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;

class CompulsoryGroupsController extends AppController {

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminAdd () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is(array('post', 'put'))) {
            $newgroup = $this->CompulsoryGroups->newEntity();
            $newgroup = $this->CompulsoryGroups->patchEntity($newgroup, $this->request->getData());

            if ($this->CompulsoryGroups->save($newgroup)) {
                $this->Flash->success(__('Gruppo aggiunto con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
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

        $compulsory_group = $this->CompulsoryGroups->findById($id)->firstOrFail();
        if (!$compulsory_group) {
            throw new NotFoundException(__('Errore: gruppo non esistente.'));
        }

        if ($this->request->is(array('post', 'put'))) {
            if ($this->CompulsoryGroups->delete($compulsory_group)) {
                $this->Flash->success(__('Gruppo cancellato con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }

        $this->Flash->error(Utils::error_to_string($compulsory_group->errors()));
        return $this->redirect(
            $this->request->referer()
        );
    }

}

?>
