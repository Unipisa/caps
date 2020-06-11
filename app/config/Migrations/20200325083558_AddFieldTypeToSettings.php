<?php
use Migrations\AbstractMigration;

class AddFieldTypeToSettings extends AbstractMigration
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
        $table = $this->table('settings');
        $table->addColumn('fieldtype', 'string', [
            'default' => 'text',
            'limit' => 255,
            'null' => false,
        ]);
        $table->update();
    }
}
