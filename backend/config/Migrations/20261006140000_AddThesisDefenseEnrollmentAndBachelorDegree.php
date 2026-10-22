<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddThesisDefenseEnrollmentAndBachelorDegree extends BaseMigration
{
    public function change(): void
    {
        // Existing submissions have no enrollment year; require it for new applications.
        $this->table('thesis_defenses')
            ->addColumn('enrollment_year', 'integer', ['null' => true])
            ->addColumn('bachelor_degree', 'string', ['limit' => 255, 'null' => true])
            ->update();
    }
}
