<?php
use Migrations\AbstractMigration;

class AddGroupToDegree extends AbstractMigration
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
        $table = $this->table('degrees');
        $table->addColumn('default_group_id', 'integer', ['null' => true])
        ->addForeignKey('default_group_id', 'groups', 'id', 
            ['delete'=> 'CASCADE', 'update'=> 'NO_ACTION']);
        $table->update();
    }
}
