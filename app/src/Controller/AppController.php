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

use Cake\Cache\Cache;
use Cake\Controller\Controller;
use Cake\Event\Event;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use App\Application;
use Cake\I18n\FrozenTime;
use Cake\Mailer\TransportFactory;
use stdClass;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\UnauthorizedException;
use Cake\Routing\Exception\RedirectException;
use Cake\Event\EventInterface;

function is_associative_array($item)
{
    return is_array($item) && (array_keys($item) !== range(0, count($item) - 1));
}

function recurseFlattenObject($object)
{
    // error_log("recurseFlattenObject (" . gettype($object) . ") " . json_encode($object));
    $obj = new stdClass(); // empty object
    if (method_exists($object, "toArray")) {
        $properties = $object->toArray();
    } elseif (is_array($object)) {
        $properties = $object;
    } else {
        $properties = get_object_vars($object);
    }
    foreach ($properties as $key => $val) {
        if (is_object($val) || is_associative_array($val)) {
            if ($val instanceof FrozenTime) {
                $obj->{$key} = $val;
            } else {
                $subobj = recurseFlattenObject($val);
                foreach ($subobj as $k => $v) {
                    $obj->{$key . "_" . $k} = $v;
                }
            }
        } elseif (is_array($val)) {
            // sequential array
            $obj->{$key} = implode(",", array_map('json_encode', $val));
        } else {
            $obj->{$key} = $val;
        }
    }
    // error_log("  return " . json_encode($obj));
    return $obj;
}

/**
 * tenta di convertire l'oggetto PHP (tipicamente sarà una Query)
 * in una tabella (array di array) la cui prima riga
 * sono le intestazioni (nomi degli attributi)
 * e le righe seguenti sono i valori di tali attributi
 */
function flatten($object)
{
    // error_log("flatten(" . json_encode($object) . ")");
    // error_log("flatten type " . gettype($object));
    if (is_array($object) || method_exists($object, "count")) {
        $array = $object;
    } else {
        $array = [$object];
    }

    $data = []; // resulting table
    $data[] = []; // add first row contains headers
    $headers_map = []; // key => column
    foreach ($array as $obj) {
        $row = [];
        array_pad($row, count($headers_map), null);
        $obj = recurseFlattenObject($obj);
        foreach ($obj as $key => $val) {
            if (array_key_exists($key, $headers_map)) {
                $row[$headers_map[$key]] = $val;
            } else {
                // add empty column to previous rows and headers
                $data[0][] = $key;
                for ($i = 1; $i < count($data); ++$i) {
                    $data[$i][] = null;
                }
                $row[] = $val;
                $headers_map[$key] = count($headers_map);
            }
        }
        $data[] = $row;
    }
    // error_log("return table: ". var_export($data,true));
    return $data;
}

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
            'viewClassMap' => ['csv' => 'CsvView.Csv']
        ]);
        $this->loadComponent('Flash');

        $this->loadComponent('Auth', [
          'authenticate' => [
            'Unipi' => Configure::read('UnipiAuthenticate')
          ],
          'authError' => false
        ]);

        $this->settingsTable = TableRegistry::getTableLocator()->get('Settings');

        $authuser = $this->Auth->user();

        // Find the user in the database and set it as the user field in the controller
        if ($authuser != null) {
            $this->user = TableRegistry::getTableLocator()->get('Users')
                ->find()
                ->where(['username' => $authuser['username']])
                ->firstOrFail();
            // can fail if the user has a valid authentication cookie but has been removed from the database 
            // TODO: should logout instead of failing...
        } else {
            $this->user = null;
        }

        // Check if the email backend is enabled
        $email_configured = TransportFactory::getConfig('default')["host"] != "";
        $this->set('email_configured', $email_configured);

        $this->Caps = Configure::Read('Caps');
        if (!array_key_exists('readonly', $this->Caps)) $this->Caps['readonly'] = False;
        $this->set('capsVersion', Application::getVersion());
        $this->set('capsShortVersion', Application::getShortVersion());
        $this->set('Caps', $this->Caps);
        $this->set('debug', Configure::read('debug'));
        $this->set('user', $this->user);
        $this->set('settings', $this->getSettings());

        $this->handleSecrets();

    }

    public function beforeFilter(Event $event) {
        if ($this->Caps['readonly']) {
            if (!$this->request->is("get") && !($this->request->getParam('controller') == 'Users' && $this->request->getParam('action') == 'login')) {
                $this->Flash->error(__("modalità sola lettura: impossibile eseguire la richiesta"));
                return($this->redirect($this->referer()));
            }
        }
    }


    /**
     * Look for a query parameter secret=XXXX, and saves it into an array of
     * secrets in the current session. These can be used to access proposals
     * of other users, and are automatically generated when the user shares
     * its proposals.
     *
     * For further details, see table proposal_auths, and in general the
     * auth field of Proposal objects.
     *
     * The saved secrets can be accessed by calling AppController::getSecrets()
     *
     * @return void
     */
    private function handleSecrets()
    {
        $request = $this->getRequest();
        $secret = $request->getQuery('secret');
        if ($secret != null)
        {
            $session = $request->getSession();
            $secrets = [ $secret ];

            if ($session->check('caps_secrets'))
            {
                $prevSecrets = json_decode($session->read('caps_secrets'));
                if (is_array($prevSecrets))
                    $secrets = array_unique(array_merge($secrets, $prevSecrets));
            }

            $session->write('caps_secrets', json_encode($secrets));
        }
    }

    /**
     * Get all the secrets stored in the users session. These are checked against
     * Proposal::auths for authorization purposes. Note these are also used to allow
     * acting on related objects, such as Attachments.
     *
     * @return array
     */
    protected function getSecrets()
    {
        $session = $this->getRequest()->getSession();
        if ($session->check('caps_secrets')) {
            $secrets = json_decode($session->read('caps_secrets'));
        }
        else {
            $secrets = [];
        }

        return $secrets;
    }

    /**
     * Obtain the array containing the current settings, in a
     * key => value format.
     *
     * @return array
     */
    public function getSettings()
    {
        return $this->settingsTable->getSettings();
    }

    /**
     * Obtain the value of a specific setting; this is a proxy to
     * SettingsTable::getSetting, and return either the value of
     * the setting, or a default value (null if not specified) if
     * not set.
     *
     * @param $field The desired setting
     * @param null $default An optional default value
     * @return mixed
     */
    public function getSetting($field, $default = null)
    {
        return $this->settingsTable->getSetting($field, $default);
    }

    public function beforeRender(Event $event)
    {
        if ($this->request->is('csv')) {
            $_serialize = $this->viewVars['_serialize'];
            if (!is_array($_serialize)) {
                $_serialize = [ $_serialize ];
            }
            foreach ($_serialize as $var) {
                $data = $this->viewVars[$var];
                $data = flatten($data);
                $this->set($var, $data);
            }
        }

        return null;
    }
}
