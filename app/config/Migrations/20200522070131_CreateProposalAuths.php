<?php
use Migrations\AbstractMigration;

class CreateProposalAuths extends AbstractMigration
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
        $table = $this->table('proposal_auths');
        
        $table->addColumn('proposal_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('email', 'string', [
            'null' => false,
        ]);
        $table->addColumn('secret', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false,
        ]);
        $table->addColumn('created_by_user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('created_on', 'datetime',[
            'default' => null,
            'null' => null,
        ]);
        $table->create();

        $table->addForeignKey('proposal_id', 'proposals')->save();
        $table->addForeignKey('created_by_user_id', 'users')->save();
    }
}
