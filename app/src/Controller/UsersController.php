<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;
use App\Controller\Event;
use App\Model\Entity\User;

class UsersController extends AppController {

    public $uses = array(
        'User',
        'Proposal'
    );

    public function beforeFilter($event) {
        parent::beforeFilter($event);
    }

    public function login() {
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user) {
                $this->Auth->setUser($user);

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
                $owner = $this->Users->find()->contain([ 'Proposals' ])
                    ->where([ 'username' => $username ])
                    ->first();

                if ($owner) {
                    $planId = $owner['proposal']['id'];
                } else {
                    $planId = false;
                }

                if ($planId && $owner['proposal']['submitted']) {
                    return $this->redirect($this->Auth->redirectUrl(array('controller' => 'proposals', 'action' => 'view', $planId)));
                }

                // ... if they still have to submit a plan, show a new form...
                if ($planId) {
                    return $this->redirect($this->Auth->redirectUrl([ 'controller' => 'proposals', 'action' => 'add' ]));
                }

		        // ... otherwise create a new user and a new plan.
		        $newuser = $this->Users->newEntity();
		        $newuser = $this->Users->patchEntity($newuser, [
	                'name' => ucwords(strtolower($user['name'])),
	                'username' => $user['user'],
	                'number' => $user['number']
		        ]);

		        $this->log( var_export($newuser, TRUE) );

                if ($this->Users->save($newuser)) {
                    $this->log('Added user ' . $user['name'] . ' to the database');

                    // Create an empty proposal for this student -- this will be probably dropped
                    // as we migrate to having more than 1 Proposal per user.
                    $p = $this->Users->Proposals->newEntity();

                    $p->id = $newuser->id;
                    $p->user = $newuser;

                    if (! $this->Users->Proposals->save($p)) {
                        $this->log("Error saving user's proposal with ID = " . $p->id);
                    }

                    return $this->redirect($this->Auth->redirectUrl([ 'controller' => 'proposals', 'action' => 'view', $p->id ]));
                }
                else {
                    $this->log('Failed to add user: ' . $user['name'] . ' to the database');
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
