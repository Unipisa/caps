<?php
use Migrations\AbstractMigration;

class DropCurriculaProposals extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('curricula_proposals');
        $table->drop()->save();
    }

    public function down()
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
