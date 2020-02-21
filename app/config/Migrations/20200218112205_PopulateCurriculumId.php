<?php
use Migrations\AbstractMigration;
use Cake\ORM\TableRegistry;

class PopulateCurriculumId extends AbstractMigration
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
        // populate the new foreign_key with
        // the old many-to-many relation
        $this->execute('update proposals set curriculum_id=(select curriculum_id from curricula_proposals where curricula_proposals.proposal_id=proposals.id)');
    }

    public function down()
    {
        $this->execute('update proposals set curriculum_id=null');
    }
}
