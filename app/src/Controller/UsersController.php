<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;
use App\Controller\Event;
use App\Model\Entity\User;
use App\Form\UsersFilterForm;
use Cake\Log\Log;
use Cake\ORM\TableRegistry;

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
        $filterData = $this->request->getQuery();
        if (!key_exists('admin', $filterData) || !$filterForm->validate($filterData)) {
          // no filter form provided or data not valid: set defaults:
          $filterData = [];
        }

        $proposals = $filterForm->execute($filterData);
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

                $count = 0;
                foreach($selected as $user_id) {
                    $user = $this->Users->findById($user_id)
                        ->firstOrFail();
                    if ($action === 'clear_admin') {
                        if ($user['id'] === $this->user['id']) {
                            $this->Flash->error(__('Non puoi rimuovere te stesso dagli amministratori'));
                            continue;
                        }
                        $user['admin'] = false;
                        if (!$this->Users->save($user)) {
                            $this->Flash->error(__('Impossibile salvare il dato'));
                            continue;
                        }
                        $this->Flash->success(__('Rimosso utente {username} dagli amministratori', ['username' => $user['username']]));
                    } else if ($action === 'set_admin') {
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
                    return $this->redirect([ 'controller' => 'proposals', 'action' => 'dashboard' ]);
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

    public function clear_admin() {

    }

    public function set_admin() {

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
