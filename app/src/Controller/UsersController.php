<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;
use App\Controller\Event;
use App\Model\Entity\User;

// App::uses('UnipiAuthenticate', 'Controller/Component/Auth');

class UsersController extends AppController {

    public $uses = array(
        'User',
        'Proposal'
    );

    public function initialize()
    {
        parent::initialize();
    }

    public function beforeFilter($event) {
        parent::beforeFilter($event);
    }

    public function login() {
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user) {

	        	// If the user is an admin, show the administration panel...
                if ($user['admin']) {
                    return $this->redirect(
                        $this->Auth->redirectUrl(
                            array(
                                'admin' => true,
                                'controller' => 'proposals',
                                'action' => 'admin_todo'
                            )
                        )
                    );
                }

		        // ... if they have a submitted plan, show that...
                $username = $user['user'];
                $owner = $this->Users->find()
                    ->where([ 'username' => $username ])
                    ->first();

                if ($owner) {
                    $planId = $owner['Proposal']['id'];
                } else {
                    $planId = false;
                }

                if ($planId && $owner['Proposal']['submitted']) {
                    return $this->redirect($this->Auth->redirectUrl(array('controller' => 'proposals', 'action' => 'view', $planId)));
                }

                // ... if they still have to submit a plan, show a new form...
                if ($planId) {
                    return $this->redirect($this->Auth->redirectUrl());
                }

		        // ... otherwise create a new user and a new plan.
		        $newuser = $this->Users->newEntity();
		        $newuser = $this->Users->patchEntity($newuser, [
		            'User' => [
		                'name' => ucwords(strtolower($user['name'])),
		                'number' => $user['number']
		            ]
		        ]);

                if ($this->Users->save($newuser)) {
                    // FIXME: Proposal creation logic does not work in its current form
                    $this->request->data['Proposal']['user_id'] = $this->User->id;
                    $this->Users->Proposal->save($this->request->data);
                    return $this->redirect($this->Auth->redirectUrl());
                }

                throw new NotFoundException();
            } else {
                $this->Session->setFlash(__('Username o password non corretti.'));
            }
        }
    }

    public function admin_login() {
        if ($this->request->is('post')) {
            if ($this->Auth->login()) {
                $user = AuthComponent::user();

	        	// If the user is an admin, show the administration panel...
                if ($user['admin']) {
                    return $this->redirect(
                        $this->Auth->redirectUrl(
                            array(
                                'admin' => true,
                                'controller' => 'proposals',
                                'action' => 'admin_todo'
                            )
                        )
                    );
                }

                throw new NotFoundException();
            } else {
                $this->Session->setFlash(__('Username o password non corretti.'));
            }
        }
    }

    /*
    public function login() {
        $this->Session->setFlash(__('CAPS è attualmente in manutenzione.'));
    }
    */

    public function logout() {
        return $this->redirect($this->Auth->logout());
    }

}

?>
