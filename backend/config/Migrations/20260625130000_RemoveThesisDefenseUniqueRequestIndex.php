<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class RemoveThesisDefenseUniqueRequestIndex extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('thesis_defenses');
        $table
            ->removeIndex(['degree_session_id', 'user_id'])
            ->addIndex(['degree_session_id', 'user_id'])
            ->update();
    }

    public function down(): void
    {
        $table = $this->table('thesis_defenses');
        $table
            ->removeIndex(['degree_session_id', 'user_id'])
            ->addIndex(['degree_session_id', 'user_id'], ['unique' => true])
            ->update();
    }
}
