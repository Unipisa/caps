<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * FreeChoiceExams Model
 *
 * @property \App\Model\Table\CurriculaTable&\Cake\ORM\Association\BelongsTo $Curricula
 *
 * @method \App\Model\Entity\FreeChoiceExam get($primaryKey, $options = [])
 * @method \App\Model\Entity\FreeChoiceExam newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\FreeChoiceExam[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\FreeChoiceExam|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\FreeChoiceExam saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\FreeChoiceExam patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\FreeChoiceExam[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\FreeChoiceExam findOrCreate($search, callable $callback = null, $options = [])
 */
class FreeChoiceExamsTable extends Table
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

        $this->setTable('free_choice_exams');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Curricula', [
            'foreignKey' => 'curriculum_id'
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
            ->integer('year')
            ->allowEmptyString('year');

        $validator
            ->integer('position')
            ->allowEmptyString('position');

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
        $rules->add($rules->existsIn(['curriculum_id'], 'Curricula'));

        return $rules;
    }
}
