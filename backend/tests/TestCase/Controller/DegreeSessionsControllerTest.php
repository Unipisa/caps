<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\ORM\TableRegistry;

class DegreeSessionsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = [
        'app.DegreeSessions',
        'app.ThesisDefenses',
        'app.Users',
        'app.Settings',
    ];

    public function testDuplicatePrefillsNewSessionAndSavesSeparately(): void
    {
        $sessions = TableRegistry::getTableLocator()->get('DegreeSessions');
        $source = $sessions->newEntity([
            'type' => 'master', 'name' => 'Sessione estiva', 'start_date' => '2027-07-01',
            'instructions' => "Prima riga.\nSeconda riga.",
            'ask_bachelor_university' => true, 'ask_second_examiners' => false,
        ]);
        $sessions->saveOrFail($source);
        $this->adminSession();

        $this->get('/degree-sessions/duplicate/' . $source->id);
        $this->assertResponseOk();
        $copy = $this->viewVariable('session');
        $this->assertTrue($copy->isNew());
        $this->assertNull($copy->id);
        $this->assertSame($source->type, $copy->type);
        $this->assertSame($source->name, $copy->name);
        $this->assertSame($source->instructions, $copy->instructions);
        $this->assertTrue($copy->ask_bachelor_university);
        $this->assertFalse($copy->ask_second_examiners);
        $this->assertEquals($source->start_date, $copy->start_date);
        $this->assertNull($copy->thesis_defenses);
        $this->assertResponseContains('action="/degree-sessions/edit"');
        $this->assertSame(1, $sessions->find()->count());

        $this->enableCsrfToken();
        $this->enableSecurityToken();
        $this->post('/degree-sessions/edit', [
            'type' => $copy->type, 'name' => 'Sessione autunnale', 'start_date' => '2027-10-01',
            'instructions' => $copy->instructions,
            'ask_bachelor_university' => '1', 'ask_second_examiners' => '0',
        ]);
        $this->assertRedirect(['controller' => 'DegreeSessions', 'action' => 'index']);
        $this->assertSame(2, $sessions->find()->count());
        $saved = $sessions->find()->where(['id !=' => $source->id])->firstOrFail();
        $this->assertSame($copy->instructions, $saved->instructions);
        $this->assertTrue($saved->ask_bachelor_university);
        $this->assertFalse($saved->ask_second_examiners);
        $original = $sessions->get($source->id);
        $this->assertSame('Sessione estiva', $original->name);
        $this->assertSame('2027-07-01', $original->start_date->format('Y-m-d'));
    }

    public function testStudentCannotDuplicateSession(): void
    {
        $this->studentSession();
        $this->get('/degree-sessions/duplicate/1');
        $this->assertResponseForbidden();
    }

    public function testDuplicateMissingSessionReturnsNotFound(): void
    {
        $this->adminSession();
        $this->get('/degree-sessions/duplicate/999');
        $this->assertResponseCode(404);
    }
}
