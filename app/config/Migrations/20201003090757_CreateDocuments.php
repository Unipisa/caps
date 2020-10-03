<?php
use Migrations\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

class CreateDocuments extends AbstractMigration
{
    /**
     * Up Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        $table = $this->table('documents');
        $table->addColumn('filename', 'text', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('owner_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('data', 'blob', [
            'default' => null,
            'null' => true,
            'limit' => MysqlAdapter::BLOB_LONG
        ]);
        $table->addColumn('created', 'datetime', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('comment', 'text', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('mimetype', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false
        ]);
        $table->create();
        $table->addForeignKey('user_id', 'users')->save();
        $table->addForeignKey('owner_id', 'users', 'id')->save();
    }

    public function down() {
        $this->table('documents')->drop()->save();
    }
}
