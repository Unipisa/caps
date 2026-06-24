<?php
declare(strict_types=1);

use Migrations\AbstractMigration;
use Phinx\Db\Adapter\MysqlAdapter;

class CreateDegreeSessionsAndThesisDefenses extends AbstractMigration
{
    public function change(): void
    {
        $sessions = $this->table('degree_sessions');
        $sessions
            ->addColumn('degree_id', 'integer', ['null' => false])
            ->addColumn('name', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('start_date', 'date', ['null' => false])
            ->addColumn('created', 'datetime', ['null' => true])
            ->addColumn('modified', 'datetime', ['null' => true])
            ->addForeignKey('degree_id', 'degrees', 'id', ['delete' => 'RESTRICT'])
            ->addIndex(['degree_id', 'start_date'])
            ->create();

        $defenses = $this->table('thesis_defenses');
        $defenses
            ->addColumn('degree_session_id', 'integer', ['null' => false])
            ->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('title', 'text', ['null' => false])
            ->addColumn('state', 'string', ['limit' => 32, 'default' => 'submitted', 'null' => false])
            ->addColumn('scheduled_at', 'datetime', ['null' => true])
            ->addColumn('venue', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('submitted_at', 'datetime', ['null' => false])
            ->addColumn('managed_at', 'datetime', ['null' => true])
            ->addColumn('created', 'datetime', ['null' => true])
            ->addColumn('modified', 'datetime', ['null' => true])
            ->addForeignKey('degree_session_id', 'degree_sessions', 'id', ['delete' => 'RESTRICT'])
            ->addForeignKey('user_id', 'users', 'id', ['delete' => 'RESTRICT'])
            ->addIndex(['degree_session_id', 'user_id'], ['unique' => true])
            ->addIndex(['state'])
            ->create();

        $advisors = $this->table('thesis_defense_advisors');
        $advisors
            ->addColumn('thesis_defense_id', 'integer', ['null' => false])
            ->addColumn('name', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('email', 'string', ['limit' => 255, 'null' => false])
            ->addForeignKey('thesis_defense_id', 'thesis_defenses', 'id', ['delete' => 'CASCADE'])
            ->create();

        $attachments = $this->table('thesis_defense_attachments');
        $attachments
            ->addColumn('thesis_defense_id', 'integer', ['null' => false])
            ->addColumn('filename', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('mimetype', 'string', ['limit' => 255, 'null' => false])
            ->addColumn('created', 'datetime', ['null' => true]);
        if ($this->getAdapter()->getConnection()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $attachments->addColumn('data', 'blob', ['null' => false, 'limit' => MysqlAdapter::BLOB_LONG]);
        } else {
            $attachments->addColumn('data', 'blob', ['null' => false]);
        }
        $attachments
            ->addForeignKey('thesis_defense_id', 'thesis_defenses', 'id', ['delete' => 'CASCADE'])
            ->create();
    }
}
