<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddThesisSessionNotesToDegrees extends BaseMigration
{
    public function change(): void
    {
        $this->table('degrees')
            ->addColumn('thesis_session_notes', 'text', ['null' => true, 'after' => 'note_default'])
            ->update();
    }
}
