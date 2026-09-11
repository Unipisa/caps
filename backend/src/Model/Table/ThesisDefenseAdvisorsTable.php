<?php
declare(strict_types=1);
namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ThesisDefenseAdvisorsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->setTable('thesis_defense_advisors');
        $this->setPrimaryKey('id');
        $this->belongsTo('ThesisDefenses', ['foreignKey' => 'thesis_defense_id', 'joinType' => 'INNER']);
    }

    public function validationDefault(Validator $validator): Validator
    {
        return $validator
            ->scalar('name')->maxLength('name', 255)->notEmptyString('name')
            ->email('email')->maxLength('email', 255)->notEmptyString('email');
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['thesis_defense_id'], 'ThesisDefenses'));
        return $rules;
    }
}
