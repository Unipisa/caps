<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class DegreeSession extends Entity
{
    public const TYPES = [
        'bachelor' => 'Laurea triennale',
        'master' => 'Laurea magistrale',
    ];

    protected array $_accessible = [
        'type' => true, 'name' => true, 'start_date' => true,
        'instructions' => true, 'ask_bachelor_university' => true, 'ask_second_examiners' => true,
        'thesis_defenses' => true,
    ];
}
