<?php
use Migrations\AbstractMigration;

class CreateTags extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $table = $this->table('tags');
        $table->addColumn('name', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false,
        ]);
        $table->create();

        // Create a Table for assigning Tags to Exams
        $table = $this->table('tags_exams');
        $table->addColumn('tag_id', 'integer', [
            'default' => null,
            'null' => false,
            'limit' => 11
        ]);
        $table->addColumn('exam_id', 'integer', [
            'default' => null,
            'null' => false,
            'limit' => 11
        ]);
        $table->addForeignKey('tag_id', 'tags', 'id');
        $table->addForeignKey('exam_id', 'exams', 'id');
        $table->create();
    }
}
