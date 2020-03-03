<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Attachment Entity
 *
 * @property int $id
 * @property string|null $filename
 * @property int|null $user_id
 * @property int|null $proposal_id
 *
 * @property \App\Model\Entity\User $user
 * @property \App\Model\Entity\Proposal $proposal
 */
class Attachment extends Entity
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
        'filename' => true,
        'user_id' => true,
        'proposal_id' => true,
        'user' => true,
        'data' => true,
        'proposal' => true
    ];
}
