<?php
declare(strict_types=1);
namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class DegreeSessionsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->setTable('degree_sessions');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');
        $this->addBehavior('Timestamp');
        $this->belongsTo('Degrees', ['foreignKey' => 'degree_id', 'joinType' => 'INNER']);
        $this->hasMany('ThesisDefenses', ['foreignKey' => 'degree_session_id', 'dependent' => false]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        return $validator
            ->integer('degree_id')->notEmptyString('degree_id')
            ->scalar('name')->maxLength('name', 255)->notEmptyString('name')
            ->date('start_date')->notEmptyDate('start_date');
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['degree_id'], 'Degrees'));
        return $rules;
    }
}
