<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class ThesisDefenseAdvisor extends Entity
{
    protected $_accessible = ['thesis_defense_id' => true, 'name' => true, 'email' => true];
}
