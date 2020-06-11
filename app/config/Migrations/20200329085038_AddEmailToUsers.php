<?php
use Migrations\AbstractMigration;

class AddEmailToUsers extends AbstractMigration
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
        $table = $this->table('users');

        $table->addColumn('email', 'string', [
            'default' => '',
            'null' => 'false',
            'limit' => 255
        ]);

        $table->update();
    }
}
