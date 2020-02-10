<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * ChosenExam Entity
 *
 * @property int $id
 * @property int|null $credits
 * @property int|null $exam_id
 * @property int|null $proposal_id
 *
 * @property \App\Model\Entity\Exam $exam
 * @property \App\Model\Entity\Proposal $proposal
 */
class ChosenExam extends Entity
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
        'credits' => true,
        'exam_id' => true,
        'proposal_id' => true,
        'exam' => true,
        'chosen_year' => true,
        'compulsory_group_id' => true,
        'compulsory_exam_id' => true,
        'compulsory_group' => true,
        'compulsory_exam' => true,
        'free_choice_exam' => true,
        'free_choice_exam_id' => true,
        'proposal' => true
    ];
}
