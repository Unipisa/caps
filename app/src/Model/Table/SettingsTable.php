<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Settings Model
 *
 * @method \App\Model\Entity\Setting get($primaryKey, $options = [])
 * @method \App\Model\Entity\Setting newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Setting[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Setting|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Setting saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Setting patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Setting[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Setting findOrCreate($search, callable $callback = null, $options = [])
 */
class SettingsTable extends Table
{
    // Here is a list of the fields which are expected to be present in the database.
    // If they are not, we automatically create the relevant fields in the form when
    // the table is loaded.
    //
    // The value specified here is the default value proposed in case there is nothing
    // set in the database. Please note that if the code queries the Settings before
    // this page is accessed and saved, then a null value will be returned, instead of
    // this default.
    //
    // Additional fields are still displayed and shown to the user, for compatibility.
    private $required_fields = [
        [ 'field' => 'user-instructions', 'value' => '', 'fieldtype' => 'textarea' ],
        [ 'field' => 'approved-message',  'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'submitted-message', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'cds', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'department', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'disclaimer', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'notified-emails', 'value' => '', 'fieldtype' => 'text' ]
    ];

    private $settingsInstance = null;

    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config)
    {
        parent::initialize($config);

        $this->setTable('settings');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->initData();
    }

    public function getSettings() {
        if ($this->settingsInstance == null) {
            $this->settingsInstance = [];

            // Load the key / value pairs from the settings table
            foreach ($this->find() as $s) {
                $this->settingsInstance[$s->field] = $s->value;
            }
        }

        return $this->settingsInstance;
    }

    public function getSetting($field, $default = null) {
        $settings = $this->getSettings();

        if (array_key_exists($field, $settings)) {
            return $settings[$field];
        }
        else {
            return $default;
        }
    }

    private function initData() {
        $this->settingsInstance = [];
        $settings_data = $this->find('all')->toArray();

        foreach ($settings_data as $s) {
            $this->settingsInstance[$s->field] = $s->value;
        }

        $settings_keys = array_map(function ($s) {
                return $s['field'];
            },
            $settings_data);

        foreach ($this->required_fields as $field) {
            if (! in_array($field['field'], $settings_keys)) {
                $newsetting = $this->newEntity($field);
                $this->save($newsetting);
                $settings_data[] = $newsetting;
                $this->settingsInstance[$newsetting->field] = $newsetting->value;
            }
        }
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator)
    {
        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->scalar('field')
            ->maxLength('field', 255)
            ->allowEmptyString('field');

        $validator
            ->scalar('value')
            ->maxLength('value', 255)
            ->allowEmptyString('value');

        $validator
            ->scalar('fieldtype')
            ->maxLength('fieldtype', 255)
            ->inList('fieldtype', [ 'text', 'textarea', 'checkbox' ]);

        return $validator;
    }
}
