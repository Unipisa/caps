<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddJsFieldToFormTemplate extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $table = $this->table('form_templates');
        $table->addColumn('code', 'string', ['null' => false, 'default' => '']);
        $table->addColumn('require_approval', 'boolean', ['null' => false, 'default' => true]);
        $table->update();
    }
}
