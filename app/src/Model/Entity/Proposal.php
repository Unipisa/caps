<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;
use \App\Model\Entity\User;

/**
 * Proposal Entity
 *
 * @property int $id
 * @property bool|null $approved
 * @property bool|null $submitted
 * @property bool|null $frozen
 * @property int|null $user_id
 * @property \Cake\I18n\FrozenTime|null $modified
 *
 * @property \App\Model\Entity\User $user
 */
class Proposal extends Entity
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
        'state' => true,
        'user_id' => true, // TODO: Forse questo campo dovrebbe non essere qui?
        'modified' => true,
        'curriculum_id' => true,
        'user' => true,
        'chosen_exams' => true,
        'chosen_free_choice_exams' => true,
        'submitted_date' => true,
        'approved_date' => true,
        'auths' => true
    ];

    public function getStateString()
    {
        switch ($this->state) {
            case 'draft':
                return 'bozza';
            case 'submitted':
                return 'sottomesso';
            case 'approved':
                return 'approvato';
            case 'rejected':
                return 'rigettato';
            default:
                return $this->state;
        }
    }

    /**
     * This functions checks if a user has the permission to add an
     * attachment to this proposal.
     *
     * @param \App\Model\Entity\User $user
     */
    public function canAddAttachment($user, $secret = null) {
        return $user != null && (
            $user['admin'] || $user['username'] == $this->user['username']) ||
            $this->checkSecret($secret);
    }

    public function checkSecret($secret) {
        if ($secret == null) {
            return false;
        }

        foreach ($this->auths as $a) {
            if ($a['secret'] == $secret) {
                return true;
            }
        }

        return false;
    }
}
