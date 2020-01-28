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
			$this->Auth->deny();

			$user = $this->Auth->user();

			$owner = $this->Users->find()
					->where([ 'username' => $user['user'] ])
					->first();

		  $proposals_table = TableRegistry::getTableLocator()->get('Proposals');
			$proposals = $proposals_table->find()->contain([ 'Users', 'Curricula' ])
				->where([ 'username' => $user['user'] ])
				->order('Proposals.modified', 'desc');

			$this->set('user', $owner);
			$this->set('owner', $owner);
			$this->set('proposals', $proposals);
		}

    public function login() {
        if ($this->request->is('post')) {
          $user = $this->Auth->identify();
          if (! $user) {
						$this->Flash->error('Username o password non corretti');
					}
					else {
            $this->Auth->setUser($user);

						// Try to find the user in the database
						$owner = $this->Users->find()
							->where([ 'username' => $user['user'] ])
							->first();

						if (! $owner) {
							// ... otherwise create a new user
			        $newuser = $this->Users->newEntity();
			        $newuser = $this->Users->patchEntity($newuser, [
		                'name' => ucwords(strtolower($user['name'])),
		                'username' => $user['user'],
		                'number' => $user['number'],
										'surname' => $user['surname'],
										'givenname' => $user['givenname']
			        ]);

	            if ($this->Users->save($newuser)) {
	              Log::write('debug', 'Added user ' . $user['name'] . ' to the database');
							}
							else {
								Log::write('error',
									'Error adding user ' . $user['name'] . ' to the database');
							}

							$owner = $newuser;
						}

	        	// If the user is an admin, show the administration panel...
            if ($user['admin']) {
              return $this->redirect(
                    $this->Auth->redirectUrl(
                        array(
                            'controller' => 'proposals',
                            'action' => 'admin_todo'
                        )
                    )
                );
            }
						else {
							return $this->redirect($this->Auth->redirectUrl([ 'action' => 'index' ]));
						}
			   }
			}
			else {
				if ($this->Auth->user()) {
					$user = $this->Auth->user();

					if ($user['admin']) {
						return $this->redirect([ 'controller' => 'proposals',
                                     'action' => 'admin_todo' ]);
					}
					else {
						return $this->redirect([ 'action' => 'index' ]);
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
