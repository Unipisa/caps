<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Degrees Model
 *
 * @property \App\Model\Table\CurriculaTable&\Cake\ORM\Association\HasMany $Curricula
 *
 * @method \App\Model\Entity\Degree get($primaryKey, $options = [])
 * @method \App\Model\Entity\Degree newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Degree[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Degree|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Degree saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Degree patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Degree[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Degree findOrCreate($search, callable $callback = null, $options = [])
 */
class DegreesTable extends Table
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

        $this->setTable('degrees');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->hasMany('Curricula', [
            'foreignKey' => 'degree_id'
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
            ->notEmptyString('name');

        $validator
            ->scalar('years')
            ->notEmptyString('years');

        $validator
            ->boolean('enable_sharing');

        return $validator;
    }
}
