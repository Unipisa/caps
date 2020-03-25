<?php
use Migrations\AbstractMigration;

class AddStateToProposals extends AbstractMigration
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
        $table = $this->table('proposals');
        $table->addColumn('state', 'string', [
            'default' => '',
            'limit' => 32,
            'null' => false,
        ]);
        $table->update();
    }
}
