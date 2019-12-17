<?php
use Migrations\AbstractMigration;

class CreateCurriculaProposals extends AbstractMigration
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
        $table = $this->table('curricula_proposals');
        $table->addColumn('curriculum_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('proposal_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addForeignKey('proposal_id', 'proposals', 'id');
        $table->addForeignKey('curriculum_id', 'curricula', 'id');
        $table->create();
    }
}
