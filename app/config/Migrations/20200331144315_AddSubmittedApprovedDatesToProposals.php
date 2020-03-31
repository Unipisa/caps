<?php
use Migrations\AbstractMigration;

class AddSubmittedApprovedDatesToProposals extends AbstractMigration
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
        $table = $this->table('proposals');

        $table->addColumn('submitted_date', 'datetime', [
            'default' => null,
            'null' => true
        ]);

        $table->addColumn('approved_date', 'datetime', [
            'default' => null,
            'null' => true
        ]);

        $table->update();

        // Set submitted_date to modified for proposals with state = 'submitted', and
        // approved_date to modified for proposals with state = 'approved';
        $this->execute('update proposals set submitted_date=modified where state=\'submitted\'');
        $this->execute('update proposals set approved_date=modified where state=\'approved\'');
    }

    public function down() {
        $table = $this->table('proposals');
        $table->removeColumn('submitted_date');
        $table->removeColumn('approved_date');
        $table->update();
    }
}
