<?php
use Migrations\AbstractMigration;

class ChangeSettingsValueLength extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        $table = $this->table('settings');
        $table->changeColumn('value', 'text', [
            'default' => null,
            'null' => false,
        ]);
        $table->update();
    }

    public function down() {
        $table = $this->table('settings');
        $table->changeColumn('value', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false,
        ]);
        $table->update();
    }
}
