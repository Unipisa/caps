<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class DegreeSession extends Entity
{
    protected $_accessible = [
        'degree_id' => true, 'name' => true, 'start_date' => true,
        'degree' => true, 'thesis_defenses' => true,
    ];
}
