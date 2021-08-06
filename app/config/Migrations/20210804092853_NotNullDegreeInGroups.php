<?php
use Migrations\AbstractMigration;

class NotNullDegreeInGroups extends AbstractMigration
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
        $table->changeColumn('degree_id', 'integer', [
            'null' => false
        ]);
        $table->update();
    }
}
