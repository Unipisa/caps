<?php
use Migrations\AbstractMigration;

class AddDegreesFreeChoiceMessages extends AbstractMigration
{
    public function up()
    {
        $degrees = $this->table('degrees');
        $degrees->addColumn('free_choice_message', 'text', [
            'null' => true
        ]);
        $degrees->save();
    }

    public function down() {
        $degrees = $this->table('degrees');
        $degrees->removeColumn('free_choice_message');
        $degrees->save();
    }
}
