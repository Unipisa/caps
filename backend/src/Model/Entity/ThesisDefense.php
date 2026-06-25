<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

class ThesisDefense extends Entity
{
    protected $_accessible = [
        'degree_session_id' => true, 'user_id' => true, 'title' => true,
        'state' => true, 'scheduled_at' => true, 'venue' => true,
        'submitted_at' => true, 'managed_at' => true, 'degree_session' => true,
        'user' => true, 'thesis_defense_advisors' => true,
        'thesis_defense_attachments' => true,
    ];
}
