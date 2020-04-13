<?php
use Migrations\AbstractMigration;

class AddUniqueCodeToExams extends AbstractMigration
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
        $table = $this->table('exams');
        $table->addIndex(['code'], ['unique' => true]);
        $table->update();
    }
}
