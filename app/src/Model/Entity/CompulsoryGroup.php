<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * CompulsoryGroup Entity
 *
 * @property int $id
 * @property int|null $year
 * @property int|null $position
 * @property int|null $group_id
 * @property int|null $curriculum_id
 *
 * @property \App\Model\Entity\Group $group
 * @property \App\Model\Entity\Curricula $curricula
 */
class CompulsoryGroup extends Entity
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
        'year' => true,
        'position' => true,
        'group_id' => true,
        'curriculum_id' => true,
        'group' => true,
        'curricula' => true
    ];
}
