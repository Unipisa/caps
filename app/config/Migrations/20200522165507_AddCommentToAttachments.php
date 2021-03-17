<?php
use Migrations\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

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
            'null' => true,
            'limit' => MysqlAdapter::BLOB_LONG
        ]);

        $table->changeColumn('mimetype', 'string',[
            'null' => true,
            'limit' => 255
        ]);

        $table->update();

        // Set all the old created fields to now
        $this->execute('update attachments set created = (select modified from proposals where proposals.id = attachments.proposal_id);');
    }

    public function down() {
        $table = $this->table('attachments');

        $table->removeColumn('created');
        $table->removeColumn('comment');

        $table->update();

    }
}
