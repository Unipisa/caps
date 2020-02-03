<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * ChosenExams Model
 *
 * @property \App\Model\Table\ExamsTable&\Cake\ORM\Association\BelongsTo $Exams
 * @property \App\Model\Table\ProposalsTable&\Cake\ORM\Association\BelongsTo $Proposals
 *
 * @method \App\Model\Entity\ChosenExam get($primaryKey, $options = [])
 * @method \App\Model\Entity\ChosenExam newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\ChosenExam[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\ChosenExam|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ChosenExam saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ChosenExam patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\ChosenExam[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\ChosenExam findOrCreate($search, callable $callback = null, $options = [])
 */
class ChosenExamsTable extends Table
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

        $this->setTable('chosen_exams');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('Exams', [
            'foreignKey' => 'exam_id'
        ]);
        $this->belongsTo('Proposals', [
            'foreignKey' => 'proposal_id'
        ]);
        $this->belongsTo('compulsoryGroup', [
            'foreignKey' => 'compulsory_group_id'
        ]);
        $this->belongsTo('compulsoryExam', [
            'foreignKey' => 'compulsory_exam_id'
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
        $rules->add($rules->existsIn(['exam_id'], 'Exams'));
        $rules->add($rules->existsIn(['proposal_id'], 'Proposals'));

        return $rules;
    }
}
