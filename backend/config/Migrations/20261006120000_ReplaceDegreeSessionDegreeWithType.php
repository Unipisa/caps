<?php
declare(strict_types=1);

use Migrations\BaseMigration;
use Migrations\Migration\IrreversibleMigrationException;

class ReplaceDegreeSessionDegreeWithType extends BaseMigration
{
    public function up(): void
    {
        // SQLite uses a string; the ORM enforces the same allowed values.
        $columnType = $this->getAdapter()->getAdapterType() === 'mysql' ? 'enum' : 'string';
        $options = $columnType === 'enum'
            ? ['values' => ['bachelor', 'master']]
            : ['limit' => 8];
        $this->table('degree_sessions')
            ->addColumn('type', $columnType, $options + ['null' => true])
            ->update();

        $this->execute("UPDATE degree_sessions SET type = CASE
            WHEN (SELECT years FROM degrees WHERE degrees.id = degree_sessions.degree_id) = 3
            THEN 'bachelor' ELSE 'master' END");

        $this->table('degree_sessions')
            ->dropForeignKey('degree_id')
            ->update();
        $this->table('degree_sessions')
            ->removeIndex(['degree_id', 'start_date'])
            ->update();
        $this->table('degree_sessions')
            ->removeColumn('degree_id')
            ->changeColumn('type', $columnType, $options + ['null' => false])
            ->addIndex(['type', 'start_date'])
            ->update();
    }

    public function down(): void
    {
        throw new IrreversibleMigrationException('The original degree association cannot be recovered from the session type.');
    }
}
