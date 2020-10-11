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
use Cake\I18n\FrozenTime;
use stdClass;
use Cake\I18n\I18n;

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

        $authuser = $this->Auth->user();

        // Find the user in the database and set it as the user field in the controller
        if ($authuser != null) {
            $this->user = TableRegistry::getTableLocator()->get('Users')
                ->find()
                ->where(['username' => $authuser['username']])
                ->firstOrFail();
        } else {
            $this->user = null;
        }

        $this->set('capsVersion', Application::getVersion());
        $this->set('capsShortVersion', Application::getShortVersion());
        $this->set('Caps', Configure::read('Caps'));
        $this->set('user', $this->user);

        // NOTE: In principle we may load the configuration only when needed,
        // to avoid a useless query. This does not appear to hurt performance
        // in any meaningful way, though.
        $this->set('settings', $this->getSettings());
    }

    private function loadSettingsTable()
    {
        if ($this->settingsTable == null) {
            $this->settingsTable = TableRegistry::getTableLocator()->get('Settings');
        }
    }

    public function getSettings()
    {
        $this->loadSettingsTable();

        return $this->settingsTable->getSettings();
    }

    public function getSetting($field, $default = null)
    {
        $this->loadSettingsTable();

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
