<?php
declare(strict_types=1);
use Migrations\AbstractMigration;
class ChangeNoteLabelToText extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('degrees');
        $table->changeColumn('note_label', 'text', ['null' => true, 'default' => null]);
        $table->update();
    }
}