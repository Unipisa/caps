<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;
use App\Model\Entity\Proposal;
use App\Model\Entity\Attachment;

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
class User extends Entity
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
        'proposal' => true,
        'givenname' => true,
        'surname' => true,
        'email' => true,
        'admin' => true
    ];

    public function getIdentifier()
    {
        return $this->username;
    }

    public function getOriginalData()
    {
        return $this;
    }

    public function canAddAttachment(Proposal $proposal, string $secret = null)
    {
        return $this['admin'] ||
            $this['id'] == $proposal->user['user_id'] ||
            $proposal->checkSecret($secret);
    }

    public function canViewAttachment(Attachment $attachment, string $secret = null)
    {
        return $this['admin'] ||
            $this['username'] == $attachment->user['username'] ||
            ($attachment->proposal != null && $this['id'] == $attachment->proposal['user_id']) ||
            ($attachment->proposal != null && $attachment->proposal->checkSecret($secret));
    }

    public function canDeleteAttachment(Attachment $attachment)
    {
        return $this['admin'] ||
            $this['id'] == $attachment['user_id'];
    }
}
