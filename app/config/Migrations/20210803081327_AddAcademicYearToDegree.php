<?php
use Migrations\AbstractMigration;

class AddAcademicYearToDegree extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        $table = $this->table('degrees');
        $table->addColumn('year', 'integer', [
            'default' => 0,
            'limit' => 11,
            'null' => false,
        ]);
        $table->update();
    }
    
    public function down() 
    {
        $table = $this->table('degrees');
        $table->removeColumn('year');
        $table->update();
    }
}
