<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * ProposalAuth Entity
 *
 * @property int $id
 * @property int|null $proposal_id
 * @property string|null $email
 * @property string|null $secret
 * @property \Cake\I18n\FrozenTime|null $created
 *
 * @property \App\Model\Entity\Proposal $proposal
 * @property \App\Model\Entity\User $user
 */
class ProposalAuth extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'proposal_id' => true,
        'email' => true,
        'secret' => true,
        'created' => true,
        'proposal' => true,
        'user' => true,
    ];
}
