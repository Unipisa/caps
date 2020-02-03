<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * ChosenFreeChoiceExam Entity
 *
 * @property int $id
 * @property string|null $name
 * @property int|null $credits
 * @property int|null $proposal_id
 *
 * @property \App\Model\Entity\Proposal $proposal
 */
class ChosenFreeChoiceExam extends Entity
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
        'name' => true,
        'credits' => true,
        'proposal_id' => true,
        'proposal' => true,
        'chosen_year' => 1,
        'free_choice_exam_id' => true,
        'free_choice_exam' => true
    ];
}
