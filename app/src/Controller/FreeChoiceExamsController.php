<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;

class FreeChoiceExamsController extends AppController {

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminAdd () {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is(['post', 'put'])) {
            $newexam = $this->FreeChoiceExams->newEntity();
            $newexam = $this->FreeChoiceExams->patchEntity($newexam, $this->request->data);

            if ($this->FreeChoiceExams->save($newexam)) {
                $this->Flash->success(__('Esame aggiunto con successo.'));
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

        $free_choice_exam = $this->FreeChoiceExams->findById($id)->firstOrFail();
        if (!$free_choice_exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }

        if ($this->request->is(['post', 'put'])) {
            if ($this->FreeChoiceExams->delete($free_choice_exam)) {
                $this->Flash->success(__('Esame cancellato con successo.'));
                return $this->redirect(
                    $this->request->referer()
                );
            }
        }

        $this->Flash->error(Utils::error_to_string($free_choice_exam->errors()));
        return $this->redirect(
            $this->request->referer()
        );
    }

}

?>
