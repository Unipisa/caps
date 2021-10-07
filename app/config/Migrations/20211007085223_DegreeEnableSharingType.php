<?php
use Migrations\AbstractMigration;

class DegreeEnableSharingType extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('degrees');
        $table->changeColumn('enable_sharing', 'smallinteger')->save();
    }

    public function down() 
    {
        $table = $this->table('degrees');
        $table->execute('UPDATE degrees set enable_sharing=0 WHERE enable_sharing=2');
        $table->changeColumn('enable_sharing', 'boolean')->save();
    }
}
