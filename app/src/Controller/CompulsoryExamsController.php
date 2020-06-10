<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;

class CompulsoryExamsController extends AppController {

    public function beforeFilter (\Cake\Event\EventInterface $event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminAdd () {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is(['post', 'put'])) {
            $newexam = $this->CompulsoryExams->newEntity();
            $newexam = $this->CompulsoryExams->patchEntity($newexam, $this->request->getData());

            if ($this->CompulsoryExams->save($newexam)) {
                $this->Flash->success(__('Esame aggiunto con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }
    }

    public function delete ($id = null) {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $compulsory_exam = $this->CompulsoryExams->findById($id)->firstOrFail();
        if (!$compulsory_exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }

        if ($this->request->is(['post', 'put'])) {
            if ($this->CompulsoryExams->delete($compulsory_exam)) {
                $this->Flash->success(__('Esame cancellato con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }

        $this->Flash->error(Utils::error_to_string($compulsory_exam->error()));
        return $this->redirect(
            $this->request->referer()
        );
    }

}

?>
