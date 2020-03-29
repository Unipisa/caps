<?php
use Migrations\AbstractMigration;

class RemoveDeprecatedFieldsFromProposals extends AbstractMigration
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

        $table->removeColumn('approved');
        $table->removeColumn('submitted');
        $table->removeColumn('frozen');

        $table->update();
    }
}
