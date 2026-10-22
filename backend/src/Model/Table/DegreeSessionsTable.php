<?php
declare(strict_types=1);
namespace App\Model\Table;

use App\Model\Entity\DegreeSession;
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
        $this->hasMany('ThesisDefenses', ['foreignKey' => 'degree_session_id', 'dependent' => false]);
    }

    public function validationDefault(Validator $validator): Validator
    {
        return $validator
            ->scalar('type')->requirePresence('type', 'create')->notEmptyString('type')
            ->inList('type', array_keys(DegreeSession::TYPES))
            ->scalar('name')->maxLength('name', 255)->notEmptyString('name')
            ->scalar('instructions')->allowEmptyString('instructions')
            ->boolean('ask_bachelor_university')->notEmptyString('ask_bachelor_university')
            ->boolean('ask_second_examiners')->notEmptyString('ask_second_examiners')
            ->date('start_date')->notEmptyDate('start_date');
    }

}
