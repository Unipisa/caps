<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddThesisDefenseSourceForm extends BaseMigration
{
    public function change(): void
    {
        // Keep provenance even if the original form is subsequently removed.
        $this->table('thesis_defenses')
            ->addColumn('source_form_id', 'integer', ['null' => true])
            ->addIndex(['source_form_id'], ['unique' => true])
            ->update();
    }
}
