<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

class FormsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = [
        'app.Degrees',
        'app.Users',
        'app.Forms',
        'app.FormTemplates',
        'app.Settings',
    ];

    public function testJsonExportUsesConfiguredFields(): void
    {
        $this->adminSession();
        $this->get('/forms/index.json');

        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true);
        $this->assertNotEmpty($data);
        $this->assertArrayHasKey('data', $data[0]);
        $this->assertArrayHasKey('user', $data[0]);
        $this->assertArrayHasKey('form_template', $data[0]);
        $this->assertArrayNotHasKey('password', $data[0]['user']);
        $this->assertArrayNotHasKey('text', $data[0]['form_template']);
        $this->assertArrayNotHasKey('code', $data[0]['form_template']);
    }
}
