<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * ProposalsFixture
 */
class ProposalsFixture extends TestFixture
{
    public $records = [
        [
            'id' => 1,
            'user_id' => 1,
            'modified' => '2021-10-14 10:25:56',
            'curriculum_id' => 1,
            'state' => 'draft',
            'submitted_date' => '2021-10-14 10:25:56',
            'approved_date' => '2021-10-14 10:25:56',
        ],
    ];
}
