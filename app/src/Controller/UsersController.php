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
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;

class UsersController extends AppController {

    public $paginate = [
        'limit' => 10,
        'order' => [
            'Users.surname' => 'asc'
        ]
    ];

    public function beforeFilter(\Cake\Event\EventInterface $event) {
        parent::beforeFilter($event);
        $this->Authentication->allowUnauthenticated([ 'login', 'oauth2Login', 'oauth2Callback' ]);
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

    private function login_user($authuser) {
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
                // if the user is not found; otherwise a user might have been granted admin privileges
                // locally and we respect that.
        ]);

        if ($this->Users->save($user)) {
            Log::write('debug', 'Added user ' . $authuser['username'] . ' to the database');
        }
        else {
            Log::write('error',
                'Error adding user ' . $authuser['username'] . ' to the database');
        }
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
                $this->login_user($authuser); 
                
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
            
            if ($this->request->getQuery('oauth2') == '1') {
                return $this->oauth2Login();
            }
        }

        $this->set('oauth2_enabled', $this->isOAuth2Enabled());
    }

    private function isOAuth2Enabled() {
        return Configure::read('UnipiAuthenticate.microsoft_oauth2_appid') != "" && 
               Configure::read('UnipiAuthenticate.microsoft_oauth2_client_secret') != "";
    }

    public function logout() {
        $this->Authentication->logout();
        return $this->redirect(
            [ 'controller' => 'users', 'action' => 'login' ]
        );
    }

    public function changePassword($id = null) {
        if ($id == null) $id = $this->user['id']; 
        if ($id != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException('Cannot change password of another user profile');
        }

        $user_entry = $this->Users->get($id);
        $this->set('user_entry', $user_entry);
        $data = $this->request->getData();

        if (isset($data['new_password'])) {
            if (isset($data['check_password']) && $data['check_password'] == $data['new_password']) {
                $user_entry->password = $data['new_password'];
                $this->Users->save($user_entry);
                $this->Flash->success(__('password modificata'));
                $this->redirect(['action' => 'view']);
            } else {
                $this->Flash->error(__('la password ripetuta non corrisponde'));
            }
        }
    }
        
    private function getOAuth2Client() {
        $appid = Configure::read('UnipiAuthenticate.microsoft_oauth2_appid');
        $client_secret = Configure::read('UnipiAuthenticate.microsoft_oauth2_client_secret');

        if ($appid == "" || $client_secret == "") {
            return null;
        }

        return new GenericProvider([
            'clientId'                => $appid,
            'clientSecret'            => $client_secret,
            'redirectUri'             => Router::url([ 'controller' => 'users', 'action' => 'oauth2Callback' ], true),
            'urlAuthorize'            => 'https://login.microsoftonline.com/c7456b31-a220-47f5-be52-473828670aa1/oauth2/v2.0/authorize',
            'urlAccessToken'          => 'https://login.microsoftonline.com/c7456b31-a220-47f5-be52-473828670aa1/oauth2/v2.0/token',
            'urlResourceOwnerDetails' => '',
            'scopes'                  => 'User.read'
        ]);
    }

    public function oauth2Login() {
        $client = $this->getOAuth2Client();

        if (!$client) {
            $this->Flash->error('OAuth2 authentication is disabled');
            return $this->redirect([ 'action' => 'login' ]);
        }
    
        $authUrl = $client->getAuthorizationUrl();
        $this->getRequest()
            ->getSession()
            ->write('oauth-state', $client->getState());

        return $this->redirect($authUrl);
    }

    public function oauth2Callback() {
        $session = $this->getRequest()->getSession();
        $expectedState = $session->read('oauth-state');
        $providedState = $this->request->getQuery('state');

        if (! $session->check('oauth-state')) {
            return $this->redirect([ 'controller' => 'users', 'action' => 'login' ]);
        }

        if ($providedState == null || $providedState != $expectedState) {
            $this->Flash->error('Mismatch in states during OAuth2');
            return $this->redirect([ 'controller' => 'users', 'action' => 'login' ]);
        }

        $authCode = $this->request->getQuery('code');
        $client = $this->getOAuth2Client();

        try {
            $accessToken = $client->getAccessToken('authorization_code', [
              'code' => $authCode
            ]);
            
            $graph = new Graph();
            $graph->setAccessToken($accessToken->getToken());
            
            $user = $graph->createRequest('GET', '/me?$select=displayName,mail,employeeId,onPremisesImmutableId,givenName,surname')
                ->setReturnType(Model\User::class)
                ->execute();

            $username = $user->getOnPremisesImmutableId();
            $number = $user->getEmployeeId();

            if ($number == "") {
                $number = $username;
            }

            $authuser = [ 
                'username' => $username,
                'givenname' => $user->getGivenName(),
                'surname' => $user->getSurname(),
                'name' => $user->getDisplayName(),
                'number' => $number, // FIXME: This is not the right number, currently
                'admin' => false,
                'email' => $user->getMail()
            ];

            $this->login_user($authuser);
    
            return  $this->redirect($this->Auth->redirectUrl());
        }
        catch (IdentityProviderException $e) {
            $this->Flash->error('Error requesting the Access Token: ' . $e->getMessage());
            return $this->redirect([ 'action' => 'login' ]);
        }

        $this->Flash->error('You are not authorized to access this page directly');
        return $this->redirect([ 'action' => 'login' ]);
    }

}

?>
