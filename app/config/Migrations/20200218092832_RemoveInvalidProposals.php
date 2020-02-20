<?php
use Migrations\AbstractMigration;

class RemoveInvalidProposals extends AbstractMigration
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
      // Migrate the current data
      // in sqlite you should fake this migration:
      // bin/cake migrations mark_migrated -o -t 20200218092832
      $this->execute('delete proposals from proposals left join curricula_proposals as cp on proposals.id=cp.proposal_id where cp.id is null;');
    }

    public function down()
    {
      // Cannot recover invalid data
    }
}
