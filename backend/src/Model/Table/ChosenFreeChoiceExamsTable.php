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
 * ChosenFreeChoiceExams Model
 *
 * @property \App\Model\Table\ProposalsTable&\Cake\ORM\Association\BelongsTo $Proposals
 *
 * @method \App\Model\Entity\ChosenFreeChoiceExam get($primaryKey, $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\ChosenFreeChoiceExam findOrCreate($search, callable $callback = null, $options = [])
 */
class ChosenFreeChoiceExamsTable extends Table
{
    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('chosen_free_choice_exams');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Proposals', [
            'foreignKey' => 'proposal_id'
        ]);
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
            ->scalar('name')
            ->maxLength('name', 255)
            ->notEmptyString('name');

        // We allow zero credits as well, mainly for drafts
        $validator
            ->integer('credits')
            ->nonNegativeInteger('credits');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules): \Cake\ORM\RulesChecker
    {
        $rules->add($rules->existsIn(['proposal_id'], 'Proposals'));

        return $rules;
    }
}
