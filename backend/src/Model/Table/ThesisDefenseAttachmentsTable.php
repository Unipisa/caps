<?php
declare(strict_types=1);
namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ThesisDefenseAttachmentsTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->setTable('thesis_defense_attachments');
        $this->setPrimaryKey('id');
        $this->addBehavior('Timestamp', ['events' => ['Model.beforeSave' => ['created' => 'new']]]);
        $this->belongsTo('ThesisDefenses', ['foreignKey' => 'thesis_defense_id', 'joinType' => 'INNER']);
    }

    public function validationDefault(Validator $validator): Validator
    {
        return $validator
            ->scalar('filename')->maxLength('filename', 255)->notEmptyString('filename')
            ->scalar('mimetype')->maxLength('mimetype', 255)->notEmptyString('mimetype')
            ->notEmptyString('data');
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['thesis_defense_id'], 'ThesisDefenses'));
        return $rules;
    }
}
