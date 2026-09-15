<?php
declare(strict_types=1);
use Migrations\BaseMigration;
class ChangeNoteLabelToText extends BaseMigration
{
    public function change()
    {
        $table = $this->table('degrees');
        $table->changeColumn('note_label', 'text', ['null' => true, 'default' => null]);
        $table->update();
    }
}