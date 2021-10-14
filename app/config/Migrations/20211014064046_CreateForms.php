<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class CreateForms extends AbstractMigration
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
        $table = $this->table('forms');
        $table->addColumn('form_template_id', 'integer', [
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'null' => false,
        ]);
        $table->addColumn('state', 'string', [
            'default' => 'draft',
            'limit' => 255,
            'null' => false,
        ]);
        $table->addColumn('date_submitted', 'date', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('date_managed', 'date', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('data', 'json', [
            'null' => false,
        ]);
        $table->addForeignKey('user_id', 'users', 'id');
        $table->addForeignKey('form_template_id', 'form_templates', 'id');
        $table->create();
    }
}
