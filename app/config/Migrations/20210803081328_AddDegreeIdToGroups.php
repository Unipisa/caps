<?php
use Migrations\AbstractMigration;

class AddDegreeIdToGroups extends AbstractMigration
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
        $table = $this->table('groups');
        $table
            ->addColumn('degree_id', 'integer')
            ->addForeignKey('degree_id', 'degrees', 'id', ['delete'=> 'CASCADE', 'update'=> 'NO_ACTION'])
            ->save();
        // NULL=true because we need to populate the field
        $table->update();
    }
}
