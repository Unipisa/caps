<?php
use Migrations\AbstractMigration;

class CreateExamsGroups extends AbstractMigration
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
        $table = $this->table('exams_groups');
        $table->addColumn('exam_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('group_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addForeignKey('exam_id', 'exams', 'id');
        $table->addForeignKey('group_id', 'group', 'id');
        $table->create();
    }
}
