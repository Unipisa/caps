<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
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

        $this->hasMany('Proposals')->setProperty('proposals');
        $this->hasMany('FreeChoiceExams')->setProperty('free_choice_exams');
        $this->hasMany('CompulsoryExams')->setProperty('compulsory_exams');
        $this->hasMany('CompulsoryGroups')->setProperty('compulsory_groups');

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
}
