<?php
use Migrations\AbstractMigration;

class AddCommentToAttachments extends AbstractMigration
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
        $table = $this->table('attachments');

        $table->addColumn('comment', 'text', [
            'null' => true,
            'default' => null
        ]);

        $table->addColumn('created', 'datetime', [
            'null' => true,
            'default' => null
        ]);

        $table->changeColumn('filename', 'string', [
            'null' => true,
            'default' => null
        ]);

        $table->changeColumn('data', 'blob', [
            'null' => true
        ]);

        $table->changeColumn('mimetype', 'string',[
            'null' => true
        ]);

        $table->update();
    }

    public function down() {
        $table = $this->table('attachments');

        $table->changeColumn('filename', 'string', [
            'null' => false,
            'default' => null
        ]);

        $table->changeColumn('data', 'blob', [
            'null' => false
        ]);

        $table->changeColumn('mimetype', 'string',[
            'null' => false
        ]);

        $table->removeColumn('created');
        $table->removeColumn('comment');

        $table->update();

    }
}
