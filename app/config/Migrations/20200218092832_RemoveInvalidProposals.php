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
    public function change()
    {
      // Migrate the current data
      $this->execute('delete proposals from proposals left join curricula_proposals as cp on proposals.id=cp.proposal_id where cp.id is null;');
    }
}
