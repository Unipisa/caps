<?php
/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link      https://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Controller;

use Cake\Controller\Controller;
use Cake\Event\Event;
use Cake\Core\Configure;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use App\Auth;
use App\Application;

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @link https://book.cakephp.org/3.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller
{
    private $settingsInstance = null;

    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading components.
     *
     * e.g. `$this->loadComponent('Security');`
     *
     * @return void
     */
    public function initialize()
    {
        parent::initialize();

        $this->loadComponent('RequestHandler', [
            'enableBeforeRedirect' => false,
        ]);
        $this->loadComponent('Flash');

        $this->loadComponent('Auth', [
          'authenticate' => [
            'Unipi' => Configure::read('UnipiAuthenticate')
          ]
        ]);

        $this->user = $this->Auth->user();

        $this->set('capsVersion', Application::getVersion());
        $this->set('Caps', Configure::read('Caps'));
        $this->set('owner', $this->user);
    }

    public function getSettings() {
        if ($this->settingsInstance == null) {
            $this->settingsInstance = [];

            // Load the key / value pairs from the settings table
            $settings_table = TableRegistry::getTableLocator()->get('Settings');
            foreach ($settings_table->find() as $s) {
                $this->settingsInstance[$s->key] = $s->value;
            }
        }

        return $this->settingsInstance;
    }

    public function getSetting($key, $default = null) {
        $settings = $this->getSettings();

        if (array_key_exists($key, $settings)) {
            return $settings[$key];
        }
        else {
            return $default;
        }
    }
}
