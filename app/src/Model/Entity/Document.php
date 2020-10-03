<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Document Entity
 *
 * @property int $id
 * @property string|null $filename
 * @property int|null $owner_id
 * @property int|null $user_id
 * @property string|resource|null $data
 * @property \Cake\I18n\FrozenTime|null $created
 * @property string|null $comment
 * @property string|null $mimetype
 *
 * @property \App\Model\Entity\User $user
 */
class Document extends Entity
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
        'owner_id' => true,
        'user_id' => true,
        'data' => true,
        'created' => true,
        'comment' => true,
        'mimetype' => true,
        'user' => true,
        'owner' => true
    ];
}
