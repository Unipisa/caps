<?php
declare(strict_types=1);

namespace App\Test\TestCase\Migrations;

use Cake\Database\Connection;
use Cake\Database\Driver\Sqlite;
use Migrations\Db\Adapter\SqliteAdapter;
use PHPUnit\Framework\TestCase;

class ReplaceDegreeSessionDegreeWithTypeTest extends TestCase
{
    public function testExistingSessionsAndDefensesArePreserved(): void
    {
        require_once CONFIG . 'Migrations/20260624120000_CreateDegreeSessionsAndThesisDefenses.php';
        require_once CONFIG . 'Migrations/20261006120000_ReplaceDegreeSessionDegreeWithType.php';
        $connection = new Connection(['driver' => Sqlite::class, 'database' => ':memory:']);
        $adapter = new SqliteAdapter(['connection' => $connection, 'adapter' => 'sqlite']);
        $connection->execute('CREATE TABLE degrees (id INTEGER PRIMARY KEY, years INTEGER)');
        $connection->execute('CREATE TABLE users (id INTEGER PRIMARY KEY)');
        $connection->execute('INSERT INTO degrees VALUES (1, 3), (2, 2)');
        $connection->execute('INSERT INTO users VALUES (1)');
        $create = new \CreateDegreeSessionsAndThesisDefenses();
        $create->setAdapter($adapter);
        $create->change();
        $connection->execute("INSERT INTO degree_sessions (id, degree_id, name, start_date)
            VALUES (1, 1, 'Triennale', '2027-01-01'), (2, 2, 'Magistrale', '2027-01-01')");
        $connection->execute("INSERT INTO thesis_defenses (degree_session_id, user_id, title, submitted_at)
            VALUES (1, 1, 'Titolo', '2026-10-01 12:00:00')");

        $migration = new \ReplaceDegreeSessionDegreeWithType();
        $migration->setAdapter($adapter);
        $migration->up();

        $sessions = $connection->execute('SELECT * FROM degree_sessions ORDER BY id')->fetchAll('assoc');
        $this->assertSame(['bachelor', 'master'], array_column($sessions, 'type'));
        $this->assertArrayNotHasKey('degree_id', $sessions[0]);
        $this->assertSame(['Triennale', 'Magistrale'], array_column($sessions, 'name'));
        $this->assertSame(1, $connection->execute('SELECT degree_session_id FROM thesis_defenses')->fetch('assoc')['degree_session_id']);
        $this->assertSame([], $connection->execute('PRAGMA foreign_key_check')->fetchAll('assoc'));
        $connection->getDriver()->disconnect();
    }
}
