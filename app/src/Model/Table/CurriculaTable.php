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
namespace App\Model\Table;

use ArrayObject;
use Cake\Event\Event;
use Cake\ORM\Entity;
use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use Cake\Validation\Validator;

/**
 * Curricula Model
 *
 * @property \App\Model\Table\ProposalsTable&\Cake\ORM\Association\BelongsToMany $Proposals
 *
 * @method \App\Model\Entity\Curricula get($primaryKey, $options = [])
 * @method \App\Model\Entity\Curricula newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Curricula[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Curricula|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Curricula saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Curricula patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Curricula[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Curricula findOrCreate($search, callable $callback = null, $options = [])
 */
class CurriculaTable extends Table
{
    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config)
    {
        parent::initialize($config);

        $this->setTable('curricula');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->hasMany('Proposals')
          ->setProperty('proposals');

        $this->hasMany('FreeChoiceExams')
          ->setProperty('free_choice_exams')
          ->setDependent(true);

        $this->hasMany('CompulsoryExams')
          ->setProperty('compulsory_exams')
          ->setDependent(true);

        $this->hasMany('CompulsoryGroups')
          ->setProperty('compulsory_groups')
          ->setDependent(true);

        $this->belongsTo('Degrees');
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
            ->scalar('name')
            ->maxLength('name', 255)
            ->allowEmptyString('name', false);

        $validator
            ->naturalNumber('academic_year');

        return $validator;
    }

    private function transformCreditsPerYear($obj) {
      if (is_array($obj['credits_per_year'])) {
        $obj['credits_per_year'] = implode(",", $obj['credits_per_year']);
      }
    }

    public function beforeMarshal(Event $event, ArrayObject $data, ArrayObject $options) {
      if (array_key_exists('credits_per_year', $data)) {
        $this->transformCreditsPerYear($data);
      }
    }

    public function beforeSave(Event $event, Entity $entity) {
      if (!$entity->has('credits_per_year') || $entity['credits_per_year'] == null) {
        $degrees = TableRegistry::getTableLocator()->get('Degrees');
        $degree = $degrees->get($entity['degree_id']);
        $entity['credits_per_year'] = implode(",", array_fill(1, $degree['years'], 60));
      }
      else {
        $this->transformCreditsPerYear($entity);
      }
    }
}
