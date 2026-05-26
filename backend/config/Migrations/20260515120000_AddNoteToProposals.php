<?php
declare(strict_types=1);
use Migrations\AbstractMigration;
class AddNoteToProposals extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('proposals');
        $table->addColumn('note', 'text', ['null' => true, 'default' => null]);
        $table->update();
    }
}