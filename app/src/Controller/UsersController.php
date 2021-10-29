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

    public function beforeFilter(\Cake\Event\EventInterface $event) {
        parent::beforeFilter($event);
        $this->Authentication->allowUnauthenticated([ 'login' ]);
    }

    public function view($id = null) {
        if ($id == null) $id = $this->user['id']; 
        if ($id != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException('Cannot access another user profile');
        }

        $user_entry = $this->Users->get($id, 
            ['contain' => ['Documents', 'Documents.Users', 'Documents.Owners']]);
        $this->set('user_entry', $user_entry);
            
        $proposals = $this->Users->Proposals->find()
            ->contain(['Users', 'Curricula', 'Curricula.Degrees'])
            ->where(['Users.id' => $id])
            ->order(['Proposals.modified' => 'DESC']);
        $this->set('proposals', $proposals);

        $forms = $this->Users->Forms->find()
            ->contain(['Users', 'FormTemplates'])
            ->where(['Users.id' => $id]);
        $this->set('forms', $forms);

        $this->viewBuilder()->setOption('serialize', ['user' => 'user_entry']);
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
        $this->viewBuilder()->setOption('serialize', [ 'users' ]);
        $this->set('paginated_users', $this->paginate($users->cleanCopy()));
    }

    public function login() {
        $this->viewBuilder()->disableAutoLayout();

        if ($this->request->is('post')) {
            $authuser = $this->Authentication->getIdentity();

            if (! $authuser) {
                $this->Flash->error('Username o password non corretti');
                Log::write('debug',
                    'User ' . $this->request->getData('username') . ' failed to authenticate'
                );
            }
            else {
                // We redirect the user to the redirectUrl, if any. Otherwise, the user will be redirected again to
                // this page with a valid session, which will send him/her to the index or admin/index depending on
                // their status.
                return $this->redirect($this->Authentication->getLoginRedirect() ?? '/');
            }
        }
        else {
            if ($this->Authentication->getIdentity()) {
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
        $this->Authentication->logout();
        return $this->redirect(
            [ 'controller' => 'users', 'action' => 'login' ]
        );
    }

}

?>
