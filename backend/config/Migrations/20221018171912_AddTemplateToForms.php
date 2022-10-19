<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddTemplateToForms extends AbstractMigration
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

        $table->addColumn('template_text', 'text', [
            'default' => null
        ]);

        $table->update();

        $conn = $this->getAdapter()->getConnection();
        if ($conn->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql") {
            $this->execute('UPDATE forms, form_templates set forms.template_text=form_templates.text WHERE forms.form_template_id=form_templates.id');
        }
        else {
            // The SQLite version of the above            
            $this->execute('UPDATE forms set template_text=(SELECT form_templates.text FROM form_templates WHERE forms.form_template_id=form_templates.id)');
        }
    }

    public function down() 
    {
        $table = $this->table('forms');
        $table->removeColumn('template_text');
        $table->update();
    }
}
