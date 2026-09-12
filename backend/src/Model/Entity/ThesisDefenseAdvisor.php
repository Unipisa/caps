<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class ThesisDefenseAdvisor extends Entity
{
    protected array $_accessible = ['thesis_defense_id' => true, 'name' => true, 'email' => true];
}
