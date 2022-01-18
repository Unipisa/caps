<?php
namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * AttachmentsFixture
 */
class AttachmentsFixture extends TestFixture
{
    public $table = 'attachments';

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
