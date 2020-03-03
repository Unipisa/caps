<?php
use Migrations\AbstractMigration;

class CreateAttachments extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $table = $this->table('attachments');
        $table->addColumn('filename', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('proposal_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('data', 'binary', [
            'default' => null,
            'null' => false
        ]);
        $table->addColumn('mimetype', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false
        ]);
        $table->create();
        $table->addForeignKey('user_id', 'users')->save();
        $table->addForeignKey('proposal_id', 'proposals')->save();
    }
}
