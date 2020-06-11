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
    // Reference to the settingsTable, which is cached in case the user requests some configuration keys. In this way,
    // we make sure that subsequent requests for configuration keys will be handled by this cache instead of triggering
    // a new query to the database.
    private $settingsTable = null;

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
          ],
          'authError' => false
        ]);

        $authuser = $this->Auth->user();

        // Find the user in the database and set it as the user field in the controller
        if ($authuser != null) {
            $this->user = TableRegistry::getTableLocator()->get('Users')
                ->find()
                ->where(['username' => $authuser['username']])
                ->firstOrFail();
        }
        else {
            $this->user = null;
        }

        $this->set('capsVersion', Application::getVersion());
        $this->set('Caps', Configure::read('Caps'));
        $this->set('user', $this->user);

        // NOTE: In principle we may load the configuration only when needed,
        // to avoid a useles query. This does not appear to hurt performance
        // in any meaningful way, though.
        $this->set('settings', $this->getSettings());
    }

    private function loadSettingsTable() {
        if ($this->settingsTable == null) {
            $this->settingsTable = TableRegistry::getTableLocator()->get('Settings');
        }
    }

    public function getSettings() {
        $this->loadSettingsTable();
        return $this->settingsTable->getSettings();
    }

    public function getSetting($field, $default = null) {
        $this->loadSettingsTable();
        return $this->settingsTable->getSetting($field, $default);
    }
}
