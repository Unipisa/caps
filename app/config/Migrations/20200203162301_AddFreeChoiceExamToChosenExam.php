<?php
use Migrations\AbstractMigration;

class AddFreeChoiceExamToChosenExam extends AbstractMigration
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
        $table = $this->table('chosen_exams');
        $table->addColumn('free_choice_exam_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => true,
        ]);
        $table->update();
        $table->addForeignKey('free_choice_exam_id', 'free_choice_exams', 'id');

    }
}
