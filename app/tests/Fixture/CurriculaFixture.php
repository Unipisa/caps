<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * CurriculaFixture
 */
class CurriculaFixture extends TestFixture
{
    /**
     * Table name
     *
     * @var string
     */
    public $table = 'curricula';
    /**
     * Fields
     *
     * @var array
     */
    // @codingStandardsIgnoreStart
    public $fields = [
        'id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => false, 'default' => null, 'autoIncrement' => true, 'precision' => null, 'comment' => null],
        'name' => ['type' => 'string', 'length' => 255, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'fixed' => null, 'collate' => null],
        'degree_id' => ['type' => 'integer', 'limit' => 11, 'null' => false],
        '_constraints' => [
            'primary' => ['type' => 'primary', 'columns' => ['id'], 'length' => []],
            'degree_id_fk' => ['type' => 'foreign', 'columns' => ['degree_id'], 'references' => ['degrees', 'id'], 'update' => 'noAction', 'delete' => 'noAction', 'length' => []],
        ]
    ];

    // @codingStandardsIgnoreEnd
    /**
     * Init method
     *
     * @return void
     */
    public function init() : void
    {
        $this->records = [
        ];
        parent::init();
    }
}
