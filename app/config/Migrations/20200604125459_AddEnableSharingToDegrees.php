<?php
use Migrations\AbstractMigration;

class AddEnableSharingToDegrees extends AbstractMigration
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
        $table = $this->table('degrees');

        $table->addColumn('enable_sharing', 'boolean', [
            'default' => true,
            'null' => false
        ]);

        $table->update();

        $this->execute('update degrees set enable_sharing = 1');
    }

    public function down() {
        $table = $this->table('degrees');
        $table->removeColumn('enable_sharing');
        $table->update();
    }
}
