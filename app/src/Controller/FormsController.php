<?php
namespace App\Controller;

use App\Model\Entity\Form;
use App\Controller\AppController;
use Cake\Http\Exception\ForbiddenException;

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

            if ($this->Forms->save($form)) {
                return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
            } else {
                $this->Flash->error(Utils::error_to_string($form->errors()));

                return $this->redirect(['action' => 'edit', $form['id']]);
            }
        }   
        $this->set('form', $form);
    }
}
