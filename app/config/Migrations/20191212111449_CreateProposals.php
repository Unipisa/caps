<?php
use Migrations\AbstractMigration;

class CreateProposals extends AbstractMigration
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
        $table = $this->table('proposals');
        $table->addColumn('approved', 'boolean', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('submitted', 'boolean', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('frozen', 'boolean', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('modified', 'datetime', [
            'default' => null,
            'null' => false,
        ]);
        $table->addForeignKey('user_id', 'users', 'id');
        $table->create();
    }
}
