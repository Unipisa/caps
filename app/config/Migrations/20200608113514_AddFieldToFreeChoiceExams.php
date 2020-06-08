<?php
use Migrations\AbstractMigration;

class AddFieldToFreeChoiceExams extends AbstractMigration
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
        $table = $this->table('free_choice_exams');

        $table->addColumn('group_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => true,
        ]);
        $table->addForeignKey('group_id', 'groups', 'id');
        $table->update();
    }
}
