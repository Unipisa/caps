<?php
declare(strict_types=1);
use Migrations\BaseMigration;
class AddNoteToDegrees extends BaseMigration
{
    public function change()
    {
        $table = $this->table('degrees');
        $table->addColumn('note_label', 'string', ['null' => true, 'default' => null]);
        $table->addColumn('note_default', 'text', ['null' => true, 'default' => null]);
        $table->update();
    }
}