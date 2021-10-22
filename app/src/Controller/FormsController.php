<?php
namespace App\Controller;

use App\Model\Entity\Form;
use App\Controller\AppController;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\I18n\Time;
class FormsController extends AppController
{    

    public function edit($form_id = null)
    {
        if (!$this->user) throw new ForbiddenException();

        if ($form_id == null) {
            $form = new Form();
            $form->user = $this->user;
            $form->state = 'draft';
        } else {
            $form = $this->Forms->find()->contain([
                'Users'])
                ->where(['Forms.id' => $form_id])
                ->firstOrFail();

            // Check if the user has permission
            if ($form['user']['id'] != $this->user['id']) {
                throw new ForbiddenException();
            }
        }

        if ($form['state'] != 'draft') {
            throw new ForbiddenException();
        }

        if ($this->request->is('post')) {
            $data = $this->request->getData();
            $form = $this->Forms->patchEntity($form, $data);
            $form->user_id = $this->user['id'];
            if ($data['action'] == 'submit') {
                $form->date_submitted = Time::now();
                $form->state = "submitted";
            } else {
                $form->state = "draft";
            }

            if ($this->Forms->save($form)) {
                return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
            } else {
                foreach ($form->errors() as $field => $errors) {
                    foreach ($errors as $error) {
                        $this->Flash->error('Errore nel campo "' . $field . '" del modulo: ' . $error);
                    }
                }
                return $this->redirect(['action' => 'edit', $form['id']]);
            }
        }   
        $this->set('form', $form);
    }

    public function view($id) {
        $query = $this->request->getQuery();
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }
        $form = $this->Forms->get($id, ['contain' => 'FormTemplates']);

        if ($form['user_id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException();
        }

        $this->set('form', $form);
        $_serialize = [ 'form' ];
        $this->set('_serialize', $_serialize);
    }

    public function delete($id)
    {
        if (! $id) {
            throw new NotFoundException();
        }

        $form = $this->Forms->get($id, ['contain' => [ 'Users' ]]);

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone delete
        // the given form.
        if ($form['user']['id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a eliminare questo modulo');
        }

        if ($form['state'] != 'draft') {
            throw new ForbiddenException('Impossibile eliminare un modulo se non è in stato \'bozza\'');
        }

        if ($this->Forms->delete($form)) {
            $this->Flash->success('Modulo eliminato');
        } else {
            $this->log('Errore nella cancellazione del modulo con ID = ' . $form['id']);
            $this->Flash->error('Impossibile eliminare il modulo');
        }

        return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
    }
}

