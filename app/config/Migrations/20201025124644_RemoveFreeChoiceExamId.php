<?php
use Migrations\AbstractMigration;

class RemoveFreeChoiceExamId extends AbstractMigration
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
        $table = $this->table('chosen_free_choice_exams');
        $table->removeColumn('free_choice_exam_id');
        $table->save();
    }

    public function down()
    {
        $table = $this->table('chosen_free_choice_exams');
        $table->addColumn('free_choice_exam_id', 'integer', [
            'default' => null,
            'null' => true
        ]);
        $table->save();
    }
}
