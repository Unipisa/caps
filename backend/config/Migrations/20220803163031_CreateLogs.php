<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class CreateLogs extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $table = $this->table('logs');
        $table->addColumn('user_id', 'integer', [
            'null' => false,
        ]);
        $table->addColumn('external_type', 'string', [
            'limit' => 16,
            'null' => false,
        ]);
        $table->addColumn('external_id', 'integer', [
            'null' => false,
        ]);
        $table->addColumn('timestamp', 'datetime', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('action', 'string', [
            'limit' => 255,
            'null' => false,
        ]);
        $table->addColumn('detail', 'text', [
            'null' => false,
        ]);
        // don't create ForeignKey so that table rows 
        // can survive user deletion
        // $table->addForeignKey('user_id', 'users', 'id');
        $table->create();
    }
}
