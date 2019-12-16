<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;
use Authentication\IdentityInterface;

/**
 * User Entity
 *
 * @property string $id
 * @property string|null $username
 * @property string|null $name
 * @property string|null $number
 *
 * @property \App\Model\Entity\Proposal[] $proposals
 */
class User extends Entity implements IdentityInterface
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
        'username' => true,
        'name' => true,
        'number' => true,
        'proposals' => true
    ];

    public function getIdentifier()
    {
        return $this->username;
    }

    public function getOriginalData()
    {
        return $this;
    }
}
