<?php
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
    public function initialize(array $config)
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
    public function validationDefault(Validator $validator)
    {
        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->scalar('name')
            ->maxLength('name', 255)
            ->allowEmptyString('name');

        $validator
            ->integer('credits')
            ->allowEmptyString('credits');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules)
    {
        $rules->add($rules->existsIn(['proposal_id'], 'Proposals'));

        return $rules;
    }
}
