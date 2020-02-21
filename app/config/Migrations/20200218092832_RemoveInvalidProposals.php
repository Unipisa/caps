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
      $this->execute('delete from proposals where id in (select proposals.id from proposals left join curricula_proposals as cp on proposals.id=cp.proposal_id where cp.id is null);');
    }

    public function down()
    {
      // Cannot recover invalid data
    }
}
