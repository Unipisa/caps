<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Forms Model
 *
 * @property \App\Model\Table\FormTemplatesTable&\Cake\ORM\Association\BelongsTo $FormTemplates
 * @property \App\Model\Table\UsersTable&\Cake\ORM\Association\BelongsTo $Users
 *
 * @method \App\Model\Entity\Form newEmptyEntity()
 * @method \App\Model\Entity\Form newEntity(array $data, array $options = [])
 * @method \App\Model\Entity\Form[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Form get($primaryKey, $options = [])
 * @method \App\Model\Entity\Form findOrCreate($search, ?callable $callback = null, $options = [])
 * @method \App\Model\Entity\Form patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Form[] patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Form|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Form saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Form[]|\Cake\Datasource\ResultSetInterface|false saveMany(iterable $entities, $options = [])
 * @method \App\Model\Entity\Form[]|\Cake\Datasource\ResultSetInterface saveManyOrFail(iterable $entities, $options = [])
 * @method \App\Model\Entity\Form[]|\Cake\Datasource\ResultSetInterface|false deleteMany(iterable $entities, $options = [])
 * @method \App\Model\Entity\Form[]|\Cake\Datasource\ResultSetInterface deleteManyOrFail(iterable $entities, $options = [])
 */
class FormsTable extends Table
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

        $this->setTable('forms');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->belongsTo('FormTemplates', [
            'foreignKey' => 'form_template_id',
            'joinType' => 'INNER',
        ]);
        $this->belongsTo('Users', [
            'foreignKey' => 'user_id',
            'joinType' => 'INNER',
        ]);
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->scalar('state')
            ->maxLength('state', 255)
            ->notEmptyString('state');

        $validator
            ->date('date_submitted')
            ->allowEmptyDate('date_submitted');

        $validator
            ->date('date_managed')
            ->allowEmptyDate('date_managed');

        $validator
            ->scalar('data')
            ->notEmptyString('data');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['form_template_id'], 'FormTemplates'), ['errorField' => 'form_template_id']);
        $rules->add($rules->existsIn(['user_id'], 'Users'), ['errorField' => 'user_id']);

        return $rules;
    }
}
