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
        [ 'field' => 'cds', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'department', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'disclaimer', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'notified-emails', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'approval-signature-text', 'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'pdf-name', 'value' => 'CAPS_%d_%n_%s_%c']
    ];

    private $settingsInstance = null;

    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('settings');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->initData();
    }

    /**
     * Obtain the array of current settings.
     *
     * @return array
     */
    public function getSettings() : array
    {
        if ($this->settingsInstance == null) {
            $this->settingsInstance = [];

            // Load the key / value pairs from the settings table
            foreach ($this->find() as $s) {
                $this->settingsInstance[$s->field] = $s->value;
            }
        }

        return $this->settingsInstance;
    }

    /**
     * Obtain the value of a certain setting, or a default value in case
     * it is not found (the latter defaults to null).
     *
     * @param $field The name of the setting to obtain
     * @param null $default A default value if the given setting is not set
     * @return mixed|null
     */
    public function getSetting(string $field, $default = null) : string
    {
        $settings = $this->getSettings();

        if (array_key_exists($field, $settings)) {
            return $settings[$field];
        } else {
            return $default;
        }
    }

    /**
     * Insert the default data into the database, in case some fields
     * are not set.
     *
     * @return void
     */
    private function initData() : void
    {
        $this->settingsInstance = [];
        $settings_data = $this->find('all')->toArray();

        foreach ($settings_data as $s) {
            $this->settingsInstance[$s->field] = $s->value;
        }

        $settings_keys = array_map(
            function ($s) {
                return $s['field'];
            },
            $settings_data
        );

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
    public function validationDefault(Validator $validator): \Cake\Validation\Validator
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
