<?php
declare(strict_types=1);
namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ThesisDefensesTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->setTable('thesis_defenses');
        $this->setDisplayField('title');
        $this->setPrimaryKey('id');
        $this->addBehavior('Timestamp');
        $this->belongsTo('DegreeSessions', ['foreignKey' => 'degree_session_id', 'joinType' => 'INNER']);
        $this->belongsTo('Users', ['foreignKey' => 'user_id', 'joinType' => 'INNER']);
        $this->hasMany('ThesisDefenseAdvisors', [
            'foreignKey' => 'thesis_defense_id', 'dependent' => true, 'cascadeCallbacks' => true,
        ]);
        $this->hasMany('ThesisDefenseAttachments', [
            'foreignKey' => 'thesis_defense_id', 'dependent' => true, 'cascadeCallbacks' => true,
        ]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        return $validator
            ->integer('degree_session_id')->notEmptyString('degree_session_id')
            ->integer('user_id')->notEmptyString('user_id')
            ->scalar('title')->notEmptyString('title')
            ->inList('state', ['submitted', 'approved', 'rejected'])
            ->dateTime('scheduled_at')->allowEmptyDateTime('scheduled_at')
            ->scalar('venue')->maxLength('venue', 255)->allowEmptyString('venue')
            ->dateTime('submitted_at')->notEmptyDateTime('submitted_at')
            ->dateTime('managed_at')->allowEmptyDateTime('managed_at');
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['degree_session_id'], 'DegreeSessions'));
        $rules->add($rules->existsIn(['user_id'], 'Users'));
        $rules->add($rules->isUnique(['degree_session_id', 'user_id']), [
            'errorField' => 'degree_session_id',
            'message' => 'Hai già presentato una domanda per questa sessione.',
        ]);
        return $rules;
    }
}
