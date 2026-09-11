<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddFieldsToThesisDefenses extends AbstractMigration
{
    public function change(): void
    {
        $this->table('thesis_defenses')
            ->addColumn('phone', 'string', ['limit' => 64, 'null' => true, 'after' => 'user_id'])
            ->addColumn('proposed_second_examiners', 'text', ['null' => true, 'after' => 'title'])
            ->addColumn('public', 'boolean', ['default' => false, 'null' => false, 'after' => 'proposed_second_examiners'])
            ->update();
    }
}
