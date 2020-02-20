<?php
use Migrations\AbstractMigration;
use Cake\ORM\TableRegistry;

class CreateProposal extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function change() {
      $table = $this->table('proposals');
      $table->addColumn('curriculum_id', 'integer', [
          'default' => null,
          'limit' => 11,
          'null' => true, // perche' prima dobbiamo riempirlo
      ]);
      $table->addForeignKey('curriculum_id', 'curricula', 'id', ['delete' => 'NO_ACTION']);
      $table->update();
    }
}
