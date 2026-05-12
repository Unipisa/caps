<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddModifiedToForms extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        $table = $this->table('forms');
        $table->addColumn('modified', 'date', [
            'null' => true
        ]);
        $table->update();
        $this->execute('UPDATE forms set modified=date_submitted WHERE date_submitted IS NOT NULL');
        $this->execute('UPDATE forms set modified=date_managed WHERE date_managed IS NOT NULL');
    }

    public function down() {
        $table = $this->table('forms');
        $table->removeColumn('modified');
        $table->update();
    }
}
