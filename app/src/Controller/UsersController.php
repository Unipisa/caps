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

use Cake\Http\Exception\ForbiddenException;
use App\Form\UsersFilterForm;
use Cake\Log\Log;

class UsersController extends AppController {

    public $paginate = [
        'limit' => 10,
        'order' => [
            'Users.surname' => 'asc'
        ]
    ];

    public function beforeFilter($event) {
        parent::beforeFilter($event);
    }

    public function view($id = null) {
        $this->Auth->deny();

        $user = $this->Users->find()
            ->contain([ 'Documents', 'Documents.Users', 'Documents.Owners' ])
            ->where([ 'username' => $this->user['username'] ])
            ->first();

        if ($id == null || $id == $user['id']) {
            $user_entry = $user;
        }
        else {
            $user_entry = $this->Users->find()
                ->contain([
                    'Documents',
                    'Documents.Users',
                    'Documents.Owners'
                ])
                ->where([ 'id' => $id ])
                ->first();
        }

        if ($id != null && !$this->user['admin'] && $id != $this->user['id'])
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

    public function index() {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }
        $users = $this->Users->find('all');

        $filterForm = new UsersFilterForm($users);
        $users = $filterForm->validate_and_execute($this->request->getQuery());
        if ($this->request->is("post")) {
            $action = null;
            foreach(['set_admin', 'clear_admin'] as $i) {
                if ($this->request->getData($i)) {
                    if ($action) {
                        $this->Flash->error(__('richiesta non valida'));
                        return $this->redirect(['action' => 'index']);
                    }
                    $action = $i;
                }
            }

            if ($action) {
                // assumo sia già stato controllato se l'utente è admin...

                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun utente selezionato'));
                    return $this->redirect(['action' => 'index']);
                }

                foreach($selected as $user_id) {
                    $user = $this->Users->findById($user_id)
                        ->firstOrFail();
                    if ($action === 'clear_admin') {
                        if ($user['id'] === $this->user['id']) {
                            $this->Flash->error(__('Non puoi rimuovere te stesso dagli amministratori'));
                            continue;
                        }
                        if (!$user['admin']) {
                            $this->Flash->error(__('L\'utente {username} non è amministratore',['username' => $user['username']]));
                            continue;
                        }
                        $user['admin'] = false;
                        if (!$this->Users->save($user)) {
                            $this->Flash->error(__('Impossibile salvare il dato'));
                            continue;
                        }
                        $this->Flash->success(__('Rimosso utente {username} dagli amministratori', ['username' => $user['username']]));
                    } else if ($action === 'set_admin') {
                        if ($user['admin']) {
                            $this->Flash->error(__('L\'utente {username} è già amministratore', ['username' => $user['username']]));
                            continue;
                        }
                        $user['admin'] = true;
                        if (!$this->Users->save($user)) {
                            $this->Flash->error(__('Impossibile salvare il dato'));
                            continue;
                        }
                        $this->Flash->success(__('Aggiunto utente {username} agli amministratori', ['username' => $user['username']]));
                    }
                }
                return $this->redirect(['action' => 'index']);
            }
        }


        $this->set('filterForm', $filterForm);
        $this->set('users', $users);
        $this->set('_serialize', [ 'users' ]);
        $this->set('paginated_users', $this->paginate($users->cleanCopy()));
    }

    public function login() {
        if ($this->request->is('post')) {
            $authuser = $this->Auth->identify();

            if (! $authuser) {
                $this->Flash->error('Username o password non corretti');
                Log::write('debug',
                    'User ' . $this->request->getData('username') . ' failed to authenticate'
                );
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
                    'admin' => $user ? $user['admin'] : $authuser['admin'] // We only use the database admin flag
                        // if the user is not found; otherwise a user might have been granted admini privileges
                        // locally and we respect that.
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
                if ($this->user['admin']) {
                    return $this->redirect([ 'controller' => 'proposals', 'action' => 'dashboard' ]);
                }
                else {
                    return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
                }
            }
        }
    }

    public function logout() {
        return $this->redirect($this->Auth->logout());
    }

}

?>
