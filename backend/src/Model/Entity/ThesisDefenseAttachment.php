<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class ThesisDefenseAttachment extends Entity
{
    protected $_accessible = [
        'thesis_defense_id' => true, 'filename' => true, 'mimetype' => true,
        'data' => true, 'created' => true,
    ];
}
