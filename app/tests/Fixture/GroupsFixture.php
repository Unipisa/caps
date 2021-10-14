<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * GroupFixture
 */
class GroupsFixture extends TestFixture
{
    /**
     * Table name
     *
     * @var string
     */
    public $table = 'groups';
    /**
     * Fields
     *
     * @var array
     */
    // @codingStandardsIgnoreStart
    public $fields = [
        'id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => false, 'default' => null, 'autoIncrement' => true, 'precision' => null, 'comment' => null],
        'degree_id' => ['type' => 'integer', 'null' => false],
        'name' => ['type' => 'string', 'length' => 255, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'fixed' => null, 'collate' => null],
        '_constraints' => [
            'primary' => ['type' => 'primary', 'columns' => ['id'], 'length' => []],
            'degree_id_fk' => ['type' => 'foreign', 'columns' => ['degree_id'], 'references' => ['degrees', 'id'], 'update' => 'noAction', 'delete' => 'cascade', 'length' => []],
        ],
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
            [ 'id' => 1, 'degree_id' => 1, 'name' => 'Gruppo di prova' ]
        ];
        parent::init();
    }
}
