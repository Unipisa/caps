<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * ProposalsFixture
 */
class ProposalsFixture extends TestFixture
{
    /**
     * Fields
     *
     * @var array
     */
    // phpcs:disable
    public $fields = [
        'id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => false, 'default' => null, 'autoIncrement' => true, 'precision' => null, 'comment' => null],
        'user_id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'autoIncrement' => null],
        'modified' => ['type' => 'datetime', 'length' => null, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null],
        'curriculum_id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'autoIncrement' => null],
        'state' => ['type' => 'string', 'length' => 32, 'null' => false, 'default' => '', 'precision' => null, 'comment' => null, 'collate' => null],
        'submitted_date' => ['type' => 'datetime', 'length' => null, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null],
        'approved_date' => ['type' => 'datetime', 'length' => null, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null],
        '_constraints' => [
            'primary' => ['type' => 'primary', 'columns' => ['id'], 'length' => []],
            'curriculum_id_fk' => ['type' => 'foreign', 'columns' => ['curriculum_id'], 'references' => ['curricula', 'id'], 'update' => 'noAction', 'delete' => 'noAction', 'length' => []],
            'user_id_fk' => ['type' => 'foreign', 'columns' => ['user_id'], 'references' => ['users', 'id'], 'update' => 'noAction', 'delete' => 'noAction', 'length' => []],
        ],
    ];
    // phpcs:enable
    /**
     * Init method
     *
     * @return void
     */
    public function init(): void
    {
        $this->records = [
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
        parent::init();
    }
}
