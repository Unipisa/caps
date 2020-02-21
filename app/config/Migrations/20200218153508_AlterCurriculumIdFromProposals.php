<?php
use Migrations\AbstractMigration;

class AlterCurriculumIdFromProposals extends AbstractMigration
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
        $table = $this->table('proposals');
        $table->changeColumn('curriculum_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false, // perche' prima dobbiamo riempirlo
        ]);
        $table->update();
    }

    public function down()
    {
      $table = $this->table('proposals');
      $table->changeColumn('curriculum_id', 'integer', [
          'default' => null,
          'limit' => 11,
          'null' => true, // perche' prima dobbiamo riempirlo
      ]);
      $table->addForeignKey('curriculum_id', 'curricula', 'id', ['delete' => 'NO_ACTION']);
      $table->update();
    }
}
