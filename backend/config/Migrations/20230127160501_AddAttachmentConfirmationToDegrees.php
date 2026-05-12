<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddAttachmentConfirmationToDegrees extends AbstractMigration
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
        $table = $this->table('degrees');

        $table->addColumn('attachment_confirmation', 'boolean', [
            'default' => false,
            'null' => false
          ]);

        $table->update();
    }

    public function down() {
        $table = $this->table('degrees');
        $table->removeColumn('attachment_confirmation');
        $table->update();
    }
}
