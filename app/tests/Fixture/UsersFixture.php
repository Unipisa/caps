<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * UsersFixture
 */
class UsersFixture extends TestFixture
{
    public $records = [
        [
            'id' => 1,
            'username' => 'mario.rossi',
            'name' => 'Mario Rossi',
            'number' => '123456',
            'email' => 'mario.rossi@rossi.com',
            'admin' => false,
            'givenname' => 'MARIO',
            'surname' => 'ROSSI'
        ],
        [
            'id' => 2,
            'username' => 'alice.verdi',
            'name' => 'ALICE VERDI',
            'number' => '24680',
            'email' => 'alice.verdi@aol.com',
            'admin' => true,
            'givenname' => 'ALICE',
            'surname' => 'VERDI'
        ],
        [
            'id' => 3,
            'username' => 'giovanni.blu',
            'name' => 'GIOVANNI BLU',
            'number' => '24681',
            'email' => 'giovanni.blu@email.com',
            'admin' => false,
            'givenname' => 'GIOVANNI',
            'surname' => 'BLU'
        ]
    ];

}
