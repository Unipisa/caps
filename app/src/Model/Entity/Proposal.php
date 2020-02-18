<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

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
        'approved' => true,
        'submitted' => true,
        'frozen' => true,
        'user_id' => true, // TODO: Forse questo campo dovrebbe non essere qui?
        'modified' => true,
        'curriculum_id' => true,
        'user' => true,
        'chosen_exams' => true,
        'chosen_free_choice_exams' => true
    ];
}
