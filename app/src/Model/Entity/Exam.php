<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Exam Entity
 *
 * @property int $id
 * @property string|null $name
 * @property string|null $code
 * @property string|null $sector
 * @property int|null $credits
 */
class Exam extends Entity
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
        'code' => true,
        'sector' => true,
        'credits' => true,
        'tags' => true
    ];

    // Get a string representation of the tags
    public function tagsToString() {
        return implode(", ",
            array_map(function ($tag) {
                return $tag['name'];
            }, $this['tags'])
        );
    }
}
