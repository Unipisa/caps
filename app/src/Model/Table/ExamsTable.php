<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\ORM\Rule\IsUnique;
use Cake\Validation\Validator;

/**
 * Exams Model
 *
 * @method \App\Model\Entity\Exam get($primaryKey, $options = [])
 * @method \App\Model\Entity\Exam newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Exam[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Exam|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Exam saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Exam patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Exam[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Exam findOrCreate($search, callable $callback = null, $options = [])
 */
class ExamsTable extends Table
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

        $this->setTable('exams');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsToMany('Groups', [
            'foreignKey' => 'exam_id',
            'targetForeignKey' => 'group_id',
            'joinTable' => 'exams_groups'
        ]);

        $this->belongsToMany('Tags', [
            'foreignKey' => 'exam_id',
            'targetForeignKey' => 'tag_id',
            'joinTable' => 'tags_exams'
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
            ->notEmptyString('name', 'Inserire un nome');

        $validator
            ->allowEmptyString('code')
            ->scalar('code')
            ->maxLength('code', 5);

        $validator
            ->scalar('sector')
            ->maxLength('sector', 15)
            ->allowEmptyString('sector');

        $validator
            ->integer('credits')
            ->notEmptyString('credits', 'Inserire un numero di crediti');

        return $validator;
    }

    public function buildRules(RulesChecker $rules)
    {
        $rules->add($rules->isUnique(['code']));

        return $rules;
    }
}
