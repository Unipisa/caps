<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * AttachmentsFixture
 */
class AttachmentsFixture extends TestFixture
{
    public $table = 'attachments';

    /**
     * Fields
     *
     * @var array
     */
    // @codingStandardsIgnoreStart
    public $fields = [
        'id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => false, 'default' => null, 'autoIncrement' => true, 'precision' => null, 'comment' => null],
        'filename' => ['type' => 'string', 'length' => 255, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'fixed' => null, 'collate' => null],
        'user_id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'autoIncrement' => null],
        'proposal_id' => ['type' => 'integer', 'length' => null, 'unsigned' => false, 'null' => true, 'default' => null, 'precision' => null, 'comment' => null, 'autoIncrement' => null],
        'data' => [ 'type' => 'binary' ],
        'mimetype' => [ 'type' => 'string', 'length' => null ],
        '_constraints' => [
           'primary' => ['type' => 'primary', 'columns' => ['id'], 'length' => []],
           'proposal_id_fk' => ['type' => 'foreign', 'columns' => ['proposal_id'], 'references' => ['proposals', 'id'], 'update' => 'noAction', 'delete' => 'noAction', 'length' => []],
           'user_id_fk' => ['type' => 'foreign', 'columns' => ['user_id'], 'references' => ['users', 'id'], 'update' => 'noAction', 'delete' => 'noAction', 'length' => []],
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
        $stream = fopen("php://memory", "r+");
        fwrite($stream, 'Lorem ipsum dolor sit amet');
        rewind($stream);

        $this->records = [
            [
                'id' => 1,
                'filename' => 'lorem.txt',
                'data' => $stream,
                'user_id' => 1,
                'proposal_id' => 1,
                'mimetype' => 'text/plain'
            ],
        ];
        parent::init();
    }
}
