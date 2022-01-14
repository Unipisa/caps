<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * GroupFixture
 */
class GroupsFixture extends TestFixture
{
    public $table = 'groups';

    public $records = [
        [ 
            'id' => 1, 
            'degree_id' => 1, 
            'name' => 'Gruppo di prova' 
        ]
    ];
}
