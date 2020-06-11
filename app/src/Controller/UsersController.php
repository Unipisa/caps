<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;
use App\Controller\Event;
use App\Model\Entity\User;
use Cake\Log\Log;
use Cake\ORM\TableRegistry;

class UsersController extends AppController {

    public function beforeFilter($event) {
        parent::beforeFilter($event);
    }

    public function index() {
        return $this->redirect([ 'action' => 'view' ]);
    }

    public function view($id = null) {
        $this->Auth->deny();

        $user = $this->Users->find()
            ->where([ 'username' => $this->user['username'] ])
            ->first();

        if ($id == null || $id == $user['id']) {
            $user_entry = $user;
        }
        else {
            $user_entry = $this->Users->find()
                ->where([ 'id' => $id ])
                ->first();
        }

        if ($id != null && !$this->user['admin'])
            throw new  ForbiddenException('Cannot access another user profile');

        $instructions = $this->getSetting('user-instructions');
        $this->set('instructions', ($instructions != null) ? $instructions : "");

        $proposals = $this->Users->Proposals->find()
            ->contain([	'Users', 'Curricula', 'Curricula.Degrees' ])
            ->where([ 'Users.id' => $user_entry['id'] ])
            ->order([ 'Proposals.modified' => 'DESC' ]);

        $this->set('user_entry', $user_entry);
        $this->set('proposals', $proposals);
    }

    public function login() {
        if ($this->request->is('post')) {
            $authuser = $this->Auth->identify();

            if (! $authuser) {
                $this->Flash->error('Username o password non corretti');
            }
            else {
                $this->Auth->setUser($authuser);

                // Try to find the user in the database
                $user = $this->Users->find()
                    ->where([ 'username' => $authuser['username'] ])
                    ->first();

                if (! $user) {
                    // ... otherwise create a new user
                    $user = $this->Users->newEntity();
                }

                // We save the user data no matter what, just in case it has changed
                // since the last update.
                $user = $this->Users->patchEntity($user, [
                    'name' => ucwords(strtolower($authuser['name'])),
                    'username' => $authuser['username'],
                    'number' => $authuser['number'],
                    'surname' => $authuser['surname'],
                    'givenname' => $authuser['givenname'],
                    'email' => $authuser['email'],
                    'admin' => $authuser['admin']
                ]);

                if ($this->Users->save($user)) {
                    Log::write('debug', 'Added user ' . $authuser['username'] . ' to the database');
                }
                else {
                    Log::write('error',
                        'Error adding user ' . $authuser['username'] . ' to the database');
                }

                // We redirect the user to the redirectUrl, if any. Otherwise, the user will be redirected again to
                // this page with a valid session, which will send him/her to the index or admin/index depending on
                // their status.
                return  $this->redirect($this->Auth->redirectUrl());
            }
        }
        else {
            if ($this->Auth->user()) {
                $user = $this->Auth->user();

                if ($user['admin']) {
                    return $this->redirect([ 'controller' => 'proposals', 'action' => 'index' ]);
                }
                else {
                    return $this->redirect([ 'controller' => 'users', 'action' => 'index' ]);
                }
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
                            ['admin' => true,
                                'controller' => 'proposals',
                                'action' => 'index']
                        )
                    );
                }

                throw new NotFoundException();
            } else {
                $this->Flash->error(__('Username o password non corretti.'));
            }
        }
    }

    /*
    public function login() {
        $this->Flash->info(__('CAPS è attualmente in manutenzione.'));
    }
    */

    public function logout() {
        return $this->redirect($this->Auth->logout());
    }

}

?>
