<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */

namespace App\Controller;


use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use App\Model\Entity\FreeChoiceExam;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Caps\Utils;
use Cake\Http\Exception\NotFoundException;

class FreeChoiceExamsController extends AppController
{
    public function beforeFilter(\Cake\Event\EventInterface $event)
    {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function adminAdd()
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->request->is(['post', 'put'])) {
            $newexam = new FreeChoiceExam();
            error_log("***" . json_encode($newexam));
            error_log("***" . json_encode($this->request->data));
            $newexam = $this->FreeChoiceExams->patchEntity($newexam, $this->request->data);
            error_log("***" . json_encode($newexam));
            error_log("***" . $newexam->group);

            if ($this->FreeChoiceExams->save($newexam)) {
                $this->Flash->success(__('Esame aggiunto con successo.'));

                return $this->redirect(
                    $this->request->referer()
                );
            }
        }
    }

    public function delete($id = null)
    {
        if (!$this->user['admin']) {
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