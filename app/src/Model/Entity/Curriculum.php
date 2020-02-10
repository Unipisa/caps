<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Curricula Entity
 *
 * @property int $id
 * @property string|null $name
 *
 * @property \App\Model\Entity\Proposal[] $proposals
 */
class Curriculum extends Entity
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
        'proposals' => true,
        'degree' => true,
        'compulsory_exams' => true,
        'compulsory_groups' => true,
        'free_choice_exams' => true,
        'academic_year' => true,
        'degree_id' => true
    ];

    public function tostring() {
        return $this['degree']['name'] .
            " — Curriculum " .
            $this['name'] .
            " — Anno Accademico " .
            $this['academic_year'] .
            "/" .
            ($this['academic_year'] + 1);
    }
}
