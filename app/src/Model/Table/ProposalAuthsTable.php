<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * ProposalAuths Model
 *
 * @property \App\Model\Table\ProposalsTable&\Cake\ORM\Association\BelongsTo $Proposals
 *
 * @method \App\Model\Entity\ProposalAuth get($primaryKey, $options = [])
 * @method \App\Model\Entity\ProposalAuth newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\ProposalAuth[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\ProposalAuth|false save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ProposalAuth saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\ProposalAuth patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\ProposalAuth[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\ProposalAuth findOrCreate($search, callable $callback = null, $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class ProposalAuthsTable extends Table
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

        $this->setTable('proposal_auths');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        $this->belongsTo('Proposals', [
            'foreignKey' => 'proposal_id',
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
            ->notEmptyString('id', null, 'create');

        $validator
            ->notEmptyString('email')
            ->email('email');

        $validator
            ->scalar('secret')
            ->maxLength('secret', 255)
            ->notEmptyString('secret');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules)
    {
        $rules->add($rules->existsIn(['proposal_id'], 'Proposals'));
        $rules->add($rules->isUnique(['secret']));

        return $rules;
    }
}
