<?php
use Migrations\AbstractMigration;

class ChangeKeyColumnNameSettings extends AbstractMigration
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
        // Using key as a column name creates problem in MySQL, so we avoid that
        $table = $this->table('settings')
            ->renameColumn('key', 'field');
        $table->update();
    }
}
