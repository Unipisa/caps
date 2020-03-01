<?php
use Migrations\AbstractMigration;

class PopulateStateInProposals extends AbstractMigration
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
        $this->execute('update proposals set state=\'draft\' where (not approved) and (not submitted)');
        $this->execute('update proposals set state=\'submitted\' where (not approved) and submitted');
        $this->execute('update proposals set state=\'approved\' where approved and submitted');
    }

    public function down()
    {
        $this->execute('update proposals set state=\'\'');
    }
}
