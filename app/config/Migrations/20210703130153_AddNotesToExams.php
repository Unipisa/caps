<?php
use Migrations\AbstractMigration;

class AddNotesToExams extends AbstractMigration
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
        $table = $this->table('exams');

        $table->addColumn('notes', 'text', [
          'null' => true
        ]);

        $table->save();
    }

    public function down() {
      $degrees = $this->table('exams');
      $degrees->removeColumn('notes');
      $degrees->save();
    }
}
