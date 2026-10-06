<?php
declare(strict_types=1);
namespace App\Model\Table;

use ArrayObject;
use Cake\Datasource\EntityInterface;
use Cake\Event\EventInterface;
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
            ->requirePresence('enrollment_year', 'create')
            ->integer('enrollment_year')->notEmptyString('enrollment_year')
            ->range('enrollment_year', [1900, (int)date('Y')], 'Inserire un anno di immatricolazione valido.')
            ->scalar('bachelor_degree')->maxLength('bachelor_degree', 255)->allowEmptyString('bachelor_degree')
            ->scalar('phone')->maxLength('phone', 64)->allowEmptyString('phone')
            ->scalar('bachelor_university')->maxLength('bachelor_university', 255)->allowEmptyString('bachelor_university')
            ->scalar('title')->notEmptyString('title')
            ->scalar('proposed_second_examiners')->allowEmptyString('proposed_second_examiners')
            ->boolean('public')->allowEmptyString('public')
            ->inList('state', ['submitted', 'approved', 'rejected'])
            ->dateTime('scheduled_at')->allowEmptyDateTime('scheduled_at')
            ->scalar('venue')->maxLength('venue', 255)->allowEmptyString('venue')
            ->dateTime('submitted_at')->notEmptyDateTime('submitted_at')
            ->dateTime('managed_at')->allowEmptyDateTime('managed_at');
    }

    public function beforeSave(EventInterface $event, EntityInterface $entity, ArrayObject $options): void
    {
        if (!$entity->isNew()) {
            return;
        }

        $session = $this->DegreeSessions->get($entity->degree_session_id);
        if (!$session->ask_bachelor_university) {
            $entity->bachelor_university = null;
            $entity->bachelor_degree = null;
        }
        if (!$session->ask_second_examiners) {
            $entity->proposed_second_examiners = null;
        }
    }

    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['degree_session_id'], 'DegreeSessions'));
        $rules->add($rules->existsIn(['user_id'], 'Users'));
        foreach (['bachelor_degree', 'bachelor_university'] as $field) {
            $rules->addCreate(function ($entity) use ($field) {
                $session = $this->DegreeSessions->find()->where(['id' => $entity->degree_session_id])->first();
                return !$session || !$session->ask_bachelor_university || trim((string)$entity->get($field)) !== '';
            }, $field . 'Required', [
                'errorField' => $field,
                'message' => 'Indicare il corso e l’ateneo della laurea triennale.',
            ]);
        }
        $rules->add(function ($entity) {
            if ($entity->state !== 'submitted') {
                return true;
            }

            $query = $this->find()
                ->where([
                    'user_id' => $entity->user_id,
                    'state' => 'submitted',
                ]);

            if (!$entity->isNew()) {
                $query->where(['id !=' => $entity->id]);
            }

            return !$query->count();
        }, 'onlyOneSubmittedThesisDefense', [
            'errorField' => 'degree_session_id',
            'message' => 'Hai già presentato una domanda di laurea in attesa di valutazione.',
        ]);
        return $rules;
    }
}
