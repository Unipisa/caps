<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * ProposalAuthsFixture
 */
class ProposalAuthsFixture extends TestFixture
{
    /**
     * Init method
     *
     * @return void
     */
    public function init() : void
    {
        $this->records = [
            [
                'id' => 1,
                'proposal_id' => 1,
                'email' => 'Lorem ipsum dolor sit amet',
                'secret' => 'Lorem ipsum dolor sit amet',
                'created' => '2020-05-22 13:58:47',
            ],
        ];
        parent::init();
    }
}
