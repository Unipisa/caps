<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddThesisDefenseUniversityAndSessionInstructions extends BaseMigration
{
    public function change(): void
    {
        $this->table('thesis_defenses')
            ->addColumn('bachelor_university', 'string', ['limit' => 255, 'null' => true])
            ->update();
        $this->table('degree_sessions')
            ->addColumn('instructions', 'text', ['null' => true])
            ->addColumn('ask_bachelor_university', 'boolean', ['default' => false, 'null' => false])
            ->addColumn('ask_second_examiners', 'boolean', ['default' => true, 'null' => false])
            ->update();
    }
}
