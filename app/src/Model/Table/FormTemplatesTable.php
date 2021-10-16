<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * FormTemplates Model
 *
 * @property \App\Model\Table\FormsTable&\Cake\ORM\Association\HasMany $Forms
 *
 * @method \App\Model\Entity\FormTemplate newEmptyEntity()
 * @method \App\Model\Entity\FormTemplate newEntity(array $data, array $options = [])
 * @method \App\Model\Entity\FormTemplate[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\FormTemplate get($primaryKey, $options = [])
 * @method \App\Model\Entity\FormTemplate findOrCreate($search, ?callable $callback = null, $options = [])
 * @method \App\Model\Entity\FormTemplate patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\FormTemplate[] patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\FormTemplate|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\FormTemplate saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\FormTemplate[]|\Cake\Datasource\ResultSetInterface|false saveMany(iterable $entities, $options = [])
 * @method \App\Model\Entity\FormTemplate[]|\Cake\Datasource\ResultSetInterface saveManyOrFail(iterable $entities, $options = [])
 * @method \App\Model\Entity\FormTemplate[]|\Cake\Datasource\ResultSetInterface|false deleteMany(iterable $entities, $options = [])
 * @method \App\Model\Entity\FormTemplate[]|\Cake\Datasource\ResultSetInterface deleteManyOrFail(iterable $entities, $options = [])
 */
class FormTemplatesTable extends Table
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

        $this->setTable('form_templates');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->hasMany('Forms', [
            'foreignKey' => 'form_template_id',
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
            ->boolean('enabled')
            ->notEmptyString('enabled');

        $validator
            ->integer('id')
            ->allowEmptyString('id', null, 'create');

        $validator
            ->scalar('name')
            ->maxLength('name', 255)
            ->requirePresence('name', 'create')
            ->notEmptyString('name');

        $validator
            ->scalar('text')
            ->requirePresence('text', 'create')
            ->notEmptyString('text');

        return $validator;
    }
}
