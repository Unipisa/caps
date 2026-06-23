<?php
namespace App\Test\TestCase\Authentication;

use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

class AdminTokenAuthenticationTest extends TestCase
{
    use IntegrationTestTrait;

    protected $fixtures = [
        'app.Documents',
        'app.FormTemplates',
        'app.Settings',
        'app.Users',
    ];

    public function setUp(): void
    {
        parent::setUp();
        Configure::write('AdminToken', [
            'token' => 'test-admin-token',
            // Deliberately use a non-admin user to verify request-only elevation.
            'username' => 'mario.rossi',
        ]);
    }

    public function tearDown(): void
    {
        Configure::delete('AdminToken');
        parent::tearDown();
    }

    public function testValidTokenGetsAdministratorAccess(): void
    {
        $this->configRequest([
            'headers' => ['Authorization' => 'Bearer test-admin-token'],
        ]);

        $this->get('/api/v1/documents');

        $this->assertResponseOk();
        $this->assertResponseContains('Lorem ipsum dolor sit amet');
    }

    public function testInvalidTokenDoesNotAuthenticate(): void
    {
        $this->configRequest([
            'headers' => ['Authorization' => 'Bearer wrong-token'],
        ]);

        $this->get('/api/v1/documents');

        $this->assertRedirect();
    }

    public function testTokenIsNotAcceptedFromQueryString(): void
    {
        $this->get('/api/v1/documents?token=test-admin-token');

        $this->assertRedirect();
    }

    public function testTokenRequestDoesNotRequireSessionCsrfToken(): void
    {
        $this->configRequest([
            'headers' => ['Authorization' => 'Bearer test-admin-token'],
        ]);

        $this->delete('/api/v1/documents/1');

        $this->assertResponseOk();
    }

    public function testTokenTakesPrecedenceOverNonAdminSession(): void
    {
        $user = TableRegistry::getTableLocator()->get('Users')->get(3);
        $this->session(['Auth' => $user]);
        $this->configRequest([
            'headers' => ['Authorization' => 'Bearer test-admin-token'],
        ]);

        $this->get('/api/v1/documents');

        $this->assertResponseOk();
        $this->assertResponseContains('Lorem ipsum dolor sit amet');
    }

    public function testMissingConfiguredUserDoesNotAuthenticate(): void
    {
        Configure::write('AdminToken.username', 'missing-user');
        $this->configRequest([
            'headers' => ['Authorization' => 'Bearer test-admin-token'],
        ]);

        $this->get('/api/v1/documents');

        $this->assertRedirect();
    }
}
