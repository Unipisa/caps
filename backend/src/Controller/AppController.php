<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
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
use App\View\XslxView;
use Cake\I18n\FrozenTime;
use Cake\Mailer\TransportFactory;
use stdClass;
use Cake\Event\EventInterface;
use App\Model\Entity\User;
use App\Model\Entity\Log;

function is_associative_array($item)
{
    return is_array($item) && (array_keys($item) !== range(0, count($item) - 1));
}

function recurseFlattenObject($object)
{
    // error_log("recurseFlattenObject (" . gettype($object) . " ) " . json_encode($object));
    $obj = new stdClass(); // empty object
    $class_name = "";
    if (is_object($object) && method_exists($object, "toArray")) {
        $class_name = get_class($object);    
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
        } else if ($class_name == "App\\Model\\Entity\\Form" && $key == "data") {
            $subobj = recurseFlattenObject(json_decode($val));
            foreach ($subobj as $k => $v) {
                $obj->{$key . "_" . $k} = $v;
            }
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
    // error_log("\nflatten type " . gettype($object));
    if (is_array($object) || (is_object($object) && method_exists($object, "count"))) {
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

    public ?User $user = null;

    private function setupTableViews() {
        $this->request->addDetector(
            'xlsx',
            [
                'accept' => [ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ],
                'param' => '_ext',
                'value' => 'xlsx',
            ]
        );

        $this->request->addDetector(
            'ods',
            [
                'accept' => [ 'application/vnd.oasis.opendocument.spreadsheet' ],
                'param' => '_ext',
                'value' => 'ods',
            ]
        );

        $this->request->addDetector(
            'csv',
            [
                'accept' => [ 'text/csv' ],
                'param' => '_ext',
                'value' => 'csv',
            ]
        );

        $this->RequestHandler->setConfig('viewClassMap.xlsx', 'Xlsx');
        $this->RequestHandler->setConfig('viewClassMap.ods',  'Ods');
        $this->RequestHandler->setConfig('viewClassMap.csv',  'Csv');
    }

    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading components.
     *
     * e.g. `$this->loadComponent('Security');`
     *
     * @return void
     */
    public function initialize() : void
    {
        parent::initialize();

        $this->loadComponent('RequestHandler', [
            'enableBeforeRedirect' => false, 
        ]);

        // Hook up the correct views for Csv, Xslx, Ods, and similar data types. 
        $this->setupTableViews();
        
        $this->loadComponent('Authentication.Authentication', [
            'logoutRedirect' => '/users/login'  // Default is false
        ]);
        $this->loadComponent('Flash');

        $this->user = $this->Authentication->getIdentity() ?? null;
        $this->settingsTable = TableRegistry::getTableLocator()->get('Settings');

        // Check if the email backend is enabled
        $email_configured = TransportFactory::getConfig('default')["host"] != "";
        $this->set('email_configured', $email_configured);

        $this->Caps = Configure::Read('Caps');
        if (!array_key_exists('readonly', $this->Caps)) $this->Caps['readonly'] = False;

        $this->form_templates_enabled = TableRegistry::getTableLocator()->get('formTemplates')->find()
            ->where(['enabled' => true])->count() > 0;

        $this->set('capsVersion', Application::getVersion());
        $this->set('capsShortVersion', Application::getShortVersion());
        $this->set('Caps', $this->Caps);
        $this->set('debug', Configure::read('debug'));
        $this->set('user', $this->user);
        $this->set('settings', $this->getSettings());
        $this->set('form_templates_enabled', $this->form_templates_enabled);

        $this->handleSecrets();

    }

    public function beforeFilter(EventInterface $event) {
        if ($this->Caps['readonly']) {
            if (!$this->request->is("get") && !($this->request->getParam('controller') == 'Users' && $this->request->getParam('action') == 'login')) {
                $this->Flash->error(__("modalità sola lettura: impossibile eseguire la richiesta"));
                return($this->redirect($this->referer()));
            }
        }

        $this->response->setTypeMap('xslx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->response->setTypeMap('ods', 'application/vnd.oasis.opendocument.spreadsheet');
    }


    /**
     * Look for a query parameter secret=XXXX, and save it into an array of
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
    private function handleSecrets() : void
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
    protected function getSecrets() : array
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
    public function getSettings() : array
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
    public function getSetting(string $field, mixed $default = null) : string
    {
        return $this->settingsTable->getSetting($field, $default);
    }

    public function beforeRender(\Cake\Event\EventInterface $event)
    {
        parent::beforeRender($event);

        if ($this->request->is('csv') || $this->request->is('xlsx') || $this->request->is('ods')) {
            $vars = $this->viewBuilder()->getOption('serialize');
            if (! is_array($vars)) {
                $vars = [ $vars ];
            }

            foreach ($vars as $var) {
                // We only convert times to strings for CSV requests. 
                $data = flatten($this->viewBuilder()->getVar($var));
                $this->set($var, $data);
            }
        }
    }

    protected function logProposalAction($proposal, $action, $details_data)
    {
        $logs_table = TableRegistry::getTableLocator()->get('Logs');
        $log = new Log();
        $logs_table->patchEntity($log,[
            "user_id" => $this->user["id"],
            "external_type" => "proposal",
            "external_id" => $proposal["id"],
            "timestamp" => FrozenTime::now(),
            "action" => $action,
            "detail" => json_encode($details_data)
        ]);
        $logs_table->save($log);
    }
}
